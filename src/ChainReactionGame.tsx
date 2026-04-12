import React, { useState, useCallback, useEffect, useRef } from 'react';
import { db } from './firebase';
import {
  doc, setDoc, onSnapshot, runTransaction, serverTimestamp,
} from 'firebase/firestore';

const ROWS = 9;
const COLS = 6;
const WAVE_DELAY = 180;

const PLAYER_COLORS = ['', '#c9a96e', '#e05c6e', '#6ea8c9'] as const;
const PLAYER_GLOW   = ['', 'rgba(201,169,110,0.6)', 'rgba(224,92,110,0.6)', 'rgba(110,168,201,0.6)'] as const;
const PLAYER_NAMES  = ['', 'Player 1', 'Player 2', 'Player 3'] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

type Cell     = { player: number; orbs: number };
type Grid     = Cell[][];
type FlatCell = { p: number; o: number };

interface GameDoc {
  grid: FlatCell[];
  currentPlayer: number;
  activePlayers: number[];
  hasPlayed: number[];
  gameOver: boolean;
  winner: number;
  playerCount: number;
  status: 'waiting' | 'playing' | 'finished';
  slots: Record<string, boolean>; // "1" | "2" | "3"
  createdAt: unknown;
}

// ─── Pure game helpers ────────────────────────────────────────────────────────

const cloneGrid = (g: Grid): Grid => g.map(row => row.map(c => ({ ...c })));
const createGrid = (): Grid =>
  Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => ({ player: 0, orbs: 0 })));

const getCriticalMass = (r: number, c: number): number => {
  let n = 4;
  if (r === 0 || r === ROWS - 1) n--;
  if (c === 0 || c === COLS - 1) n--;
  return n;
};

const getNeighbors = (r: number, c: number): [number, number][] => {
  const n: [number, number][] = [];
  if (r > 0)        n.push([r - 1, c]);
  if (r < ROWS - 1) n.push([r + 1, c]);
  if (c > 0)        n.push([r, c - 1]);
  if (c < COLS - 1) n.push([r, c + 1]);
  return n;
};

const countOrbsByPlayer = (g: Grid): Record<number, number> => {
  const counts: Record<number, number> = {};
  for (const row of g)
    for (const cell of row)
      if (cell.player > 0)
        counts[cell.player] = (counts[cell.player] ?? 0) + cell.orbs;
  return counts;
};

const MAX_WAVES = 500; // hard safety cap
const MAX_ANIM_FRAMES = 30; // max setTimeout calls queued for animation

const computeWaves = (grid: Grid, r0: number, c0: number, player: number): Grid[] => {
  const states: Grid[] = [];
  let cur = cloneGrid(grid);
  cur[r0][c0].orbs  += 1;
  cur[r0][c0].player = player;
  states.push(cloneGrid(cur));

  for (let iter = 0; iter < MAX_WAVES; iter++) {
    const boom: [number, number][] = [];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (cur[r][c].orbs >= getCriticalMass(r, c)) boom.push([r, c]);
    if (boom.length === 0) break;

    const next = cloneGrid(cur);
    for (const [r, c] of boom) {
      const crit = getCriticalMass(r, c);
      next[r][c].orbs -= crit;
      if (next[r][c].orbs === 0) next[r][c].player = 0;
      for (const [nr, nc] of getNeighbors(r, c)) {
        next[nr][nc].orbs  += 1;
        next[nr][nc].player = player;
      }
    }
    cur = next;
    states.push(cloneGrid(cur));
  }
  return states;
};

/** Down-sample waves to at most MAX_ANIM_FRAMES entries, always keeping first and last. */
const sampleWaves = (waves: Grid[]): Grid[] => {
  if (waves.length <= MAX_ANIM_FRAMES) return waves;
  const step = (waves.length - 1) / (MAX_ANIM_FRAMES - 1);
  const out: Grid[] = [];
  for (let i = 0; i < MAX_ANIM_FRAMES - 1; i++)
    out.push(waves[Math.round(i * step)]);
  out.push(waves[waves.length - 1]); // always include final state
  return out;
};

// ─── Firestore serialization ──────────────────────────────────────────────────

const gridToFlat = (grid: Grid): FlatCell[] =>
  grid.flat().map(c => ({ p: c.player, o: c.orbs }));

const flatToGrid = (flat: FlatCell[]): Grid =>
  Array.from({ length: ROWS }, (_, r) =>
    flat.slice(r * COLS, (r + 1) * COLS).map(c => ({ player: c.p, orbs: c.o }))
  );

// ─── Session persistence (survives page refresh) ──────────────────────────────

const SESSION_KEY = 'cr_session_v1';
interface Session { gameId: string; slot: number }

const getSession  = (): Session | null => {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null'); }
  catch { return null; }
};
const saveSession  = (s: Session) => sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
const clearSession = () => sessionStorage.removeItem(SESSION_KEY);
const genId        = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// ─── Orb display (3D spheres) ─────────────────────────────────────────────────

const ORB_POSITIONS: [number, number][][] = [
  [],
  [[50, 50]],
  [[31, 50], [69, 50]],
  [[50, 28], [27, 68], [73, 68]],
  [[27, 27], [73, 27], [27, 73], [73, 73]],
];

// Radial gradients: bright highlight → mid → deep shadow
const SPHERE_GRADIENT = [
  '',
  'radial-gradient(circle at 36% 30%, #faebd0, #c9a96e 52%, #5c3508)',
  'radial-gradient(circle at 36% 30%, #ffb8c0, #e05c6e 52%, #6a0715)',
  'radial-gradient(circle at 36% 30%, #b8e0f8, #6ea8c9 52%, #0e3d5a)',
] as const;

const SPHERE_GLOW = ['', '#c9a96e', '#e05c6e', '#6ea8c9'] as const;

const OrbDisplay: React.FC<{ count: number; player: number; size: number }> = ({ count, player, size }) => {
  const capped   = Math.min(count, 4);
  const gradient = SPHERE_GRADIENT[player as 1|2|3] ?? SPHERE_GRADIENT[1];
  const glow     = SPHERE_GLOW[player as 1|2|3] ?? SPHERE_GLOW[1];
  // Scale orb to ~50% cell for 1 orb, ~36% for 2, ~30% for 3+
  const pct      = capped === 1 ? 0.50 : capped === 2 ? 0.38 : 0.30;
  const dotSize  = Math.max(8, Math.round(size * pct));

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {ORB_POSITIONS[capped].map(([x, y], i) => (
        <div key={i} className="orb-dot" style={{
          position: 'absolute',
          left: `${x}%`, top: `${y}%`,
          transform: 'translate(-50%,-50%)',
          width: dotSize, height: dotSize,
          borderRadius: '50%',
          background: gradient,
          boxShadow: `0 2px 6px rgba(0,0,0,0.7), 0 0 ${Math.round(dotSize * 0.5)}px ${glow}88`,
        }} />
      ))}
      {count > 4 && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: glow, fontSize: 13, fontWeight: 700, fontFamily: 'Montserrat, sans-serif',
          textShadow: `0 0 8px ${glow}`,
        }}>
          {count}
        </div>
      )}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const ChainReactionGame: React.FC = () => {
  // Navigation / lobby state
  const [view, setView]       = useState<'lobby' | 'waiting' | 'game'>('lobby');
  const [gameId, setGameId]   = useState('');
  const [mySlot, setMySlot]   = useState(0);
  const [gameDoc, setGameDoc] = useState<GameDoc | null>(null);
  const [joinInput, setJoinInput] = useState('');
  const [pcInput, setPcInput] = useState<2 | 3>(2);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);

  // Board / animation state
  const [localGrid, setLocalGrid] = useState<Grid>(createGrid);
  const [animating, setAnimating] = useState(false);
  const [exploding, setExploding] = useState<Set<string>>(new Set());
  const [hovered, setHovered]     = useState<string | null>(null);
  const [windowW, setWindowW]     = useState(window.innerWidth);

  const timersRef  = useRef<ReturnType<typeof setTimeout>[]>([]);
  const animRef    = useRef(false);
  const unsubRef   = useRef<(() => void) | null>(null);

  // Keep animRef in sync
  useEffect(() => { animRef.current = animating; }, [animating]);

  useEffect(() => {
    const onResize = () => setWindowW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Restore session on mount
  useEffect(() => {
    const s = getSession();
    if (s) restoreSession(s);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => () => { clearTimers(); unsubRef.current?.(); }, []);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const cellSize = Math.min(Math.floor((windowW - 48) / COLS), 64);

  // ─── Firestore subscription ─────────────────────────────────────────────────

  const subscribeToGame = (gid: string, slot: number) => {
    unsubRef.current?.();
    const ref = doc(db, 'games', gid);
    unsubRef.current = onSnapshot(ref, snap => {
      if (!snap.exists()) return;
      const data = snap.data() as GameDoc;
      setGameDoc(data);

      // Other players' moves: sync grid when not animating
      if (data.currentPlayer !== slot && !animRef.current) {
        setLocalGrid(flatToGrid(data.grid));
      }

      // Transition views based on status
      if (data.status === 'playing' || data.status === 'finished') {
        setLocalGrid(flatToGrid(data.grid));
        setView('game');
      }
    });
  };

  const restoreSession = (s: Session) => {
    setGameId(s.gameId);
    setMySlot(s.slot);
    subscribeToGame(s.gameId, s.slot);
  };

  // ─── Lobby actions ──────────────────────────────────────────────────────────

  const createGame = async () => {
    setError('');
    setLoading(true);
    try {
      const gid = genId();
      const slots: Record<string, boolean> = {};
      for (let i = 1; i <= pcInput; i++) slots[String(i)] = i === 1;

      const initial: GameDoc = {
        grid: gridToFlat(createGrid()),
        currentPlayer: 1,
        activePlayers: Array.from({ length: pcInput }, (_, i) => i + 1),
        hasPlayed: [],
        gameOver: false,
        winner: 0,
        playerCount: pcInput,
        status: 'waiting',
        slots,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'games', gid), initial);
      const session = { gameId: gid, slot: 1 };
      saveSession(session);
      setGameId(gid);
      setMySlot(1);
      subscribeToGame(gid, 1);
      setView('waiting');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  const joinGame = async () => {
    const code = joinInput.trim().toUpperCase();
    if (!code) { setError('Enter a game code'); return; }
    setError('');
    setLoading(true);
    try {
      const ref = doc(db, 'games', code);
      let assignedSlot = 0;

      await runTransaction(db, async tx => {
        const snap = await tx.get(ref);
        if (!snap.exists()) throw new Error('Game not found');
        const data = snap.data() as GameDoc;
        if (data.status === 'finished') throw new Error('That game is already over');

        for (let s = 1; s <= data.playerCount; s++) {
          if (!data.slots[String(s)]) { assignedSlot = s; break; }
        }
        if (assignedSlot === 0) throw new Error('Game is full');

        const newSlots = { ...data.slots, [String(assignedSlot)]: true };
        const allFilled = Object.values(newSlots).every(Boolean);
        tx.update(ref, { slots: newSlots, ...(allFilled ? { status: 'playing' } : {}) });
      });

      const session = { gameId: code, slot: assignedSlot };
      saveSession(session);
      setGameId(code);
      setMySlot(assignedSlot);
      subscribeToGame(code, assignedSlot);
      setView('waiting');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to join game');
    } finally {
      setLoading(false);
    }
  };

  const leaveGame = () => {
    clearTimers();
    clearSession();
    unsubRef.current?.();
    unsubRef.current = null;
    setGameId(''); setMySlot(0); setGameDoc(null);
    setLocalGrid(createGrid()); setView('lobby');
    setError(''); setJoinInput('');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(gameId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ─── Game move ──────────────────────────────────────────────────────────────

  const handleClick = useCallback(async (r: number, c: number) => {
    if (!gameDoc || animating || gameDoc.gameOver) return;
    if (gameDoc.currentPlayer !== mySlot) return;

    const cell = localGrid[r][c];
    if (cell.player !== 0 && cell.player !== mySlot) return;

    const startGrid  = flatToGrid(gameDoc.grid);
    const waves      = computeWaves(startGrid, r, c, mySlot);
    const finalGrid  = waves[waves.length - 1];
    const animFrames = sampleWaves(waves);

    // Compute resulting game state
    const newHasPlayed   = Array.from(new Set([...gameDoc.hasPlayed, mySlot]));
    const orbCounts      = countOrbsByPlayer(finalGrid);
    const allStarted     = gameDoc.activePlayers.every(p => newHasPlayed.includes(p));
    const newActive      = allStarted
      ? gameDoc.activePlayers.filter(p => (orbCounts[p] ?? 0) > 0)
      : [...gameDoc.activePlayers];
    const won            = newActive.length === 1;
    const newWinner      = won ? newActive[0] : 0;
    const idx            = newActive.indexOf(mySlot);
    const nextPlayer     = won ? 0 : newActive[(idx === -1 ? 0 : idx + 1) % newActive.length];

    const writeMove = async () => {
      try {
        await runTransaction(db, async tx => {
          const snap = await tx.get(doc(db, 'games', gameId));
          if (!snap.exists()) return;
          if ((snap.data() as GameDoc).currentPlayer !== mySlot) return; // race guard
          tx.update(doc(db, 'games', gameId), {
            grid: gridToFlat(finalGrid),
            currentPlayer: nextPlayer,
            activePlayers: newActive,
            hasPlayed: newHasPlayed,
            gameOver: won,
            winner: newWinner,
            status: won ? 'finished' : 'playing',
          });
        });
      } catch (e) {
        console.error('Move write failed:', e);
      }
    };

    clearTimers();

    if (waves.length === 1) {
      setLocalGrid(finalGrid);
      await writeMove();
      return;
    }

    setAnimating(true);
    animFrames.forEach((waveGrid, i) => {
      const t = setTimeout(async () => {
        setLocalGrid(waveGrid);
        if (i < animFrames.length - 1) {
          const ex = new Set<string>();
          for (let row = 0; row < ROWS; row++)
            for (let col = 0; col < COLS; col++)
              if (waveGrid[row][col].orbs >= getCriticalMass(row, col))
                ex.add(`${row},${col}`);
          setExploding(ex);
        } else {
          setExploding(new Set());
          setAnimating(false);
          await writeMove();
        }
      }, i * WAVE_DELAY);
      timersRef.current.push(t);
    });
  }, [gameDoc, localGrid, mySlot, animating, gameId]);

  // ─── Render helpers ──────────────────────────────────────────────────────────

  const wrap = (children: React.ReactNode) => (
    <div style={{
      minHeight: '100vh', background: '#050505',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontFamily: 'Montserrat, sans-serif', color: '#f5f0e8',
      padding: '28px 16px 40px', boxSizing: 'border-box',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <a href="/" style={{ color: '#c9a96e', textDecoration: 'none', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.6 }}>
          ← Portfolio
        </a>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(26px,5vw,40px)', fontWeight: 300, color: '#c9a96e', margin: '6px 0 0', letterSpacing: '0.06em' }}>
          Chain Reaction
        </h1>
      </div>
      {children}
      <style>{GAME_CSS}</style>
    </div>
  );

  // ─── Lobby ───────────────────────────────────────────────────────────────────

  if (view === 'lobby') return wrap(
    <div style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Create */}
      <div style={card}>
        <Label>Create Game</Label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {([2, 3] as const).map(n => (
            <button key={n} onClick={() => setPcInput(n)} style={{
              flex: 1, padding: '8px',
              background: pcInput === n ? '#c9a96e22' : 'transparent',
              border: `1px solid ${pcInput === n ? '#c9a96e' : '#444'}`,
              color: pcInput === n ? '#c9a96e' : '#777',
              borderRadius: 4, cursor: 'pointer', fontSize: 11,
              letterSpacing: '0.08em', fontFamily: 'Montserrat, sans-serif',
              transition: 'all 0.2s',
            }}>
              {n} Players
            </button>
          ))}
        </div>
        <GoldButton onClick={createGame} disabled={loading}>
          {loading ? 'Creating…' : 'Create Game'}
        </GoldButton>
      </div>

      <Divider />

      {/* Join */}
      <div style={card}>
        <Label>Join Game</Label>
        <input
          value={joinInput}
          onChange={e => setJoinInput(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && joinGame()}
          placeholder="GAME CODE"
          maxLength={6}
          style={{
            width: '100%', padding: '10px 12px', marginBottom: 12,
            background: '#1c1c1c', border: '1px solid #444',
            color: '#f5f0e8', borderRadius: 4, fontSize: 14,
            letterSpacing: '0.22em', textAlign: 'center',
            fontFamily: 'Montserrat, sans-serif', boxSizing: 'border-box',
            outline: 'none',
          }}
        />
        <OutlineButton onClick={joinGame} disabled={loading}>
          {loading ? 'Joining…' : 'Join Game'}
        </OutlineButton>
      </div>

      {error && <p style={{ textAlign: 'center', color: '#e05c6e', fontSize: 12, margin: 0 }}>{error}</p>}
    </div>
  );

  // ─── Waiting room ─────────────────────────────────────────────────────────────

  if (view === 'waiting') {
    const slots  = gameDoc?.slots ?? {};
    const pc     = gameDoc?.playerCount ?? pcInput;
    const filled = Object.values(slots).filter(Boolean).length;
    return wrap(
      <div style={{ width: '100%', maxWidth: 340, textAlign: 'center' }}>
        <div style={{ ...card, marginBottom: 16 }}>
          <p style={{ fontSize: 10, opacity: 0.4, letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 10px' }}>
            Game Code
          </p>
          <div style={{ fontSize: 34, letterSpacing: '0.3em', fontWeight: 700, color: '#c9a96e', margin: '0 0 12px' }}>
            {gameId}
          </div>
          <button onClick={copyCode} style={{
            padding: '6px 18px', background: 'transparent',
            border: '1px solid #c9a96e44', color: '#c9a96e88',
            borderRadius: 4, cursor: 'pointer', fontSize: 10,
            letterSpacing: '0.1em', fontFamily: 'Montserrat, sans-serif',
          }}>
            {copied ? '✓ Copied' : 'Copy Code'}
          </button>

          <div style={{ margin: '24px 0 10px', display: 'flex', justifyContent: 'center', gap: 16 }}>
            {Array.from({ length: pc }, (_, i) => i + 1).map(s => (
              <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 14, height: 14, borderRadius: '50%',
                  background: slots[String(s)] ? PLAYER_COLORS[s as 1|2|3] : '#333',
                  boxShadow: slots[String(s)] ? `0 0 10px ${PLAYER_COLORS[s as 1|2|3]}` : 'none',
                  transition: 'all 0.3s',
                }} />
                <span style={{ fontSize: 9, opacity: slots[String(s)] ? 0.7 : 0.3, letterSpacing: '0.06em' }}>
                  {PLAYER_NAMES[s as 1|2|3]}
                </span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 11, opacity: 0.4, margin: '0', letterSpacing: '0.04em' }}>
            {filled}/{pc} joined — waiting for {pc - filled} more…
          </p>
        </div>

        <p style={{ fontSize: 11, opacity: 0.35, marginBottom: 16 }}>
          You are{' '}
          <span style={{ color: PLAYER_COLORS[mySlot as 1|2|3], fontWeight: 600 }}>
            {PLAYER_NAMES[mySlot as 1|2|3]}
          </span>
        </p>

        <button onClick={leaveGame} style={{
          padding: '8px 24px', background: 'transparent',
          border: '1px solid #444', color: '#666',
          borderRadius: 4, cursor: 'pointer', fontSize: 10,
          letterSpacing: '0.1em', fontFamily: 'Montserrat, sans-serif',
        }}>
          Leave
        </button>
      </div>
    );
  }

  // ─── Game board ───────────────────────────────────────────────────────────────

  const isMyTurn = gameDoc?.currentPlayer === mySlot && !gameDoc?.gameOver;

  return wrap(
    <>
      {/* Player indicators */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        {Array.from({ length: gameDoc?.playerCount ?? 2 }, (_, i) => i + 1).map(p => {
          const active     = gameDoc?.currentPlayer === p && !gameDoc?.gameOver;
          const eliminated = gameDoc ? !gameDoc.activePlayers.includes(p) && gameDoc.hasPlayed.includes(p) : false;
          return (
            <div key={p} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 14px', borderRadius: 6,
              border: `1px solid ${active ? PLAYER_COLORS[p as 1|2|3] : 'transparent'}`,
              background: active ? `${PLAYER_GLOW[p as 1|2|3]}28` : 'transparent',
              opacity: eliminated ? 0.25 : 1,
              transition: 'all 0.25s ease',
            }}>
              <div style={{
                width: 11, height: 11, borderRadius: '50%',
                background: PLAYER_COLORS[p as 1|2|3],
                boxShadow: active ? `0 0 10px ${PLAYER_COLORS[p as 1|2|3]}` : 'none',
                transition: 'box-shadow 0.25s',
              }} />
              <span style={{
                fontSize: 11, letterSpacing: '0.06em',
                opacity: active ? 1 : 0.4,
                textDecoration: eliminated ? 'line-through' : 'none',
              }}>
                {PLAYER_NAMES[p as 1|2|3]}{p === mySlot ? ' (you)' : ''}
              </span>
            </div>
          );
        })}
      </div>

      {/* 3D perspective wrapper */}
      <div style={{ perspective: '560px', perspectiveOrigin: '50% -20px' }}>
        <div style={{ transform: 'rotateX(22deg)', transformOrigin: 'top center', transformStyle: 'preserve-3d' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, ${cellSize}px)`,
            gap: 3,
            background: '#3a0000',
            padding: 5,
            borderRadius: 6,
            boxShadow: '0 24px 64px rgba(0,0,0,0.9), 0 4px 24px rgba(180,0,0,0.35)',
            border: '1px solid #5a0000',
          }}>
            {localGrid.map((row, r) => row.map((cell, c) => {
              const key      = `${r},${c}`;
              const crit     = getCriticalMass(r, c);
              const isExplod = exploding.has(key);
              const isHov    = hovered === key;
              const canClick = isMyTurn && !animating && (cell.player === 0 || cell.player === mySlot);
              const danger   = cell.orbs >= crit - 1 && cell.orbs > 0;
              const pColor   = cell.player ? PLAYER_COLORS[cell.player as 1|2|3] : null;

              return (
                <div
                  key={key}
                  onClick={() => handleClick(r, c)}
                  onMouseEnter={() => canClick && setHovered(key)}
                  onMouseLeave={() => setHovered(null)}
                  className={`game-cell${isExplod ? ' cell-explode' : ''}`}
                  style={{
                    width: cellSize, height: cellSize,
                    position: 'relative', cursor: canClick ? 'pointer' : 'default',
                    boxSizing: 'border-box',
                    background: isExplod
                      ? `radial-gradient(ellipse at 40% 35%, ${PLAYER_COLORS[mySlot as 1|2|3]}55, #1a0000)`
                      : pColor
                        ? `radial-gradient(ellipse at 30% 25%, ${pColor}28, #0a0202)`
                        : isHov
                          ? `radial-gradient(ellipse at 30% 25%, ${PLAYER_COLORS[mySlot as 1|2|3]}18, #110303)`
                          : '#080202',
                    borderTop:    `1px solid ${isExplod ? '#ff4444' : pColor ? `${pColor}${danger ? 'cc' : '55'}` : '#280000'}`,
                    borderLeft:   `1px solid ${isExplod ? '#ff4444' : pColor ? `${pColor}${danger ? 'cc' : '55'}` : '#280000'}`,
                    borderBottom: `1px solid ${isExplod ? '#ff6666' : pColor ? `${pColor}${danger ? 'ff' : '88'}` : '#480000'}`,
                    borderRight:  `1px solid ${isExplod ? '#ff6666' : pColor ? `${pColor}${danger ? 'ff' : '88'}` : '#480000'}`,
                    transition: 'background 0.1s',
                  }}
                >
                  {cell.orbs > 0 && <OrbDisplay count={cell.orbs} player={cell.player} size={cellSize} />}
                  <div style={{ position: 'absolute', bottom: 2, right: 3, fontSize: 7, opacity: 0.2, lineHeight: 1, userSelect: 'none', color: '#ff6666' }}>
                    {crit}
                  </div>
                </div>
              );
            }))}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div style={{ marginTop: 14, fontSize: 11, letterSpacing: '0.1em', minHeight: 18, textAlign: 'center' }}>
        {animating
          ? <span style={{ opacity: 0.4 }}>CHAIN REACTION…</span>
          : gameDoc?.gameOver ? null
          : isMyTurn
            ? <span style={{ color: PLAYER_COLORS[mySlot as 1|2|3] }}>YOUR TURN</span>
            : <span style={{ opacity: 0.4 }}>
                {PLAYER_NAMES[(gameDoc?.currentPlayer ?? 1) as 1|2|3]}'S TURN
              </span>
        }
      </div>

      <button onClick={leaveGame} style={{
        marginTop: 14, padding: '8px 24px', background: 'transparent',
        border: '1px solid #c9a96e44', color: '#c9a96e', borderRadius: 4,
        cursor: 'pointer', fontSize: 10, letterSpacing: '0.12em',
        textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif',
      }}>
        Leave Game
      </button>

      <div style={{ marginTop: 20, maxWidth: 340, fontSize: 11, opacity: 0.28, lineHeight: 1.8, textAlign: 'center', letterSpacing: '0.04em' }}>
        Click your cells to place orbs. Critical mass (corner=2, edge=3, center=4)
        triggers explosions, converting neighbors. Last player standing wins.
      </div>

      {/* Win overlay */}
      {gameDoc?.gameOver && gameDoc.winner > 0 && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(20,20,20,0.92)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, backdropFilter: 'blur(10px)',
        }}>
          <div style={{
            textAlign: 'center', padding: '48px 56px', background: '#222',
            borderRadius: 12,
            border: `1px solid ${PLAYER_COLORS[gameDoc.winner as 1|2|3]}55`,
            boxShadow: `0 24px 64px rgba(0,0,0,0.6), 0 0 48px ${PLAYER_GLOW[gameDoc.winner as 1|2|3]}`,
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: PLAYER_COLORS[gameDoc.winner as 1|2|3],
              margin: '0 auto 20px',
              boxShadow: `0 0 24px ${PLAYER_COLORS[gameDoc.winner as 1|2|3]}`,
              animation: 'orbPulse 1.2s ease-in-out infinite',
            }} />
            <h2 style={{
              fontFamily: 'Cormorant Garamond, serif', fontSize: 38, fontWeight: 300,
              color: PLAYER_COLORS[gameDoc.winner as 1|2|3], margin: '0 0 6px',
            }}>
              {gameDoc.winner === mySlot ? 'You Win!' : `${PLAYER_NAMES[gameDoc.winner as 1|2|3]} Wins`}
            </h2>
            <p style={{ fontSize: 10, opacity: 0.45, letterSpacing: '0.16em', margin: '0 0 32px', textTransform: 'uppercase' }}>
              Chain Reaction Complete
            </p>
            <button onClick={leaveGame} style={{
              padding: '12px 40px', background: PLAYER_COLORS[gameDoc.winner as 1|2|3],
              border: 'none', color: '#1c1c1c', borderRadius: 4, cursor: 'pointer',
              fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
              fontWeight: 700, fontFamily: 'Montserrat, sans-serif',
            }}>
              Back to Lobby
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// ─── Shared UI atoms ──────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: '#0e0202', borderRadius: 10,
  padding: '24px', border: '1px solid #2a0000',
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.45, margin: '0 0 14px' }}>
    {children}
  </p>
);

const GoldButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button {...props} style={{
    width: '100%', padding: '11px', background: '#c9a96e',
    border: 'none', color: '#1c1c1c', borderRadius: 4,
    cursor: props.disabled ? 'wait' : 'pointer', fontSize: 11,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    fontWeight: 700, fontFamily: 'Montserrat, sans-serif',
    opacity: props.disabled ? 0.6 : 1,
  }}>
    {children}
  </button>
);

const OutlineButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button {...props} style={{
    width: '100%', padding: '11px', background: 'transparent',
    border: '1px solid #c9a96e88', color: '#c9a96e', borderRadius: 4,
    cursor: props.disabled ? 'wait' : 'pointer', fontSize: 11,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    fontFamily: 'Montserrat, sans-serif', opacity: props.disabled ? 0.6 : 1,
    transition: 'all 0.2s',
  }}>
    {children}
  </button>
);

const Divider: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <div style={{ flex: 1, height: 1, background: '#2e2e2e' }} />
    <span style={{ fontSize: 10, opacity: 0.3, letterSpacing: '0.1em' }}>OR</span>
    <div style={{ flex: 1, height: 1, background: '#2e2e2e' }} />
  </div>
);

const GAME_CSS = `
  /* 3D cell walls via pseudo-elements */
  .game-cell { overflow: visible !important; }

  .game-cell::after {
    content: '';
    position: absolute;
    left: calc(100% + 0px);
    top: 2px;
    width: 3px;
    height: calc(100% + 1px);
    background: linear-gradient(to bottom, #5a0000, #200000);
    pointer-events: none;
  }
  .game-cell::before {
    content: '';
    position: absolute;
    top: calc(100% + 0px);
    left: 2px;
    height: 3px;
    width: calc(100% + 1px);
    background: linear-gradient(to right, #5a0000, #200000);
    pointer-events: none;
  }

  .cell-explode { animation: cellBurst 0.18s ease-out; }
  .orb-dot      { animation: orbPop 0.22s cubic-bezier(.17,.67,.46,1.4) both; }

  @keyframes cellBurst {
    0%  { transform: scale(1);    filter: brightness(1);   }
    40% { transform: scale(1.15); filter: brightness(2.2); }
    100%{ transform: scale(1);    filter: brightness(1);   }
  }
  @keyframes orbPop {
    0%  { transform: translate(-50%,-50%) scale(0);    opacity: 0; }
    60% { transform: translate(-50%,-50%) scale(1.3);              }
    100%{ transform: translate(-50%,-50%) scale(1);    opacity: 1; }
  }
  @keyframes orbPulse {
    0%,100%{ transform: scale(1);    opacity: 1;    }
    50%    { transform: scale(1.4);  opacity: 0.75; }
  }
  input::placeholder { opacity: 0.3; letter-spacing: 0.1em; }
  input:focus { border-color: #c9a96e88 !important; }
`;

export default ChainReactionGame;
