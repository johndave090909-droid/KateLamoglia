import React, { useState, useCallback, useEffect, useRef } from 'react';

const ROWS = 9;
const COLS = 6;
const WAVE_DELAY = 180; // ms between explosion waves

const PLAYER_COLORS = ['', '#c9a96e', '#e05c6e', '#6ea8c9'] as const;
const PLAYER_GLOW   = ['', 'rgba(201,169,110,0.6)', 'rgba(224,92,110,0.6)', 'rgba(110,168,201,0.6)'] as const;
const PLAYER_NAMES  = ['', 'Player 1', 'Player 2', 'Player 3'] as const;

type Cell = { player: number; orbs: number };
type Grid = Cell[][];

// ─── Pure helpers ────────────────────────────────────────────────────────────

const cloneGrid = (g: Grid): Grid => g.map(row => row.map(c => ({ ...c })));

const createGrid = (): Grid =>
  Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ player: 0, orbs: 0 }))
  );

const getCriticalMass = (row: number, col: number): number => {
  let n = 4;
  if (row === 0 || row === ROWS - 1) n--;
  if (col === 0 || col === COLS - 1) n--;
  return n;
};

const getNeighbors = (row: number, col: number): [number, number][] => {
  const n: [number, number][] = [];
  if (row > 0)        n.push([row - 1, col]);
  if (row < ROWS - 1) n.push([row + 1, col]);
  if (col > 0)        n.push([row, col - 1]);
  if (col < COLS - 1) n.push([row, col + 1]);
  return n;
};

/** Returns orb count per player: { 1: n, 2: n, 3: n } */
const countOrbsByPlayer = (g: Grid): Record<number, number> => {
  const counts: Record<number, number> = {};
  for (const row of g)
    for (const cell of row)
      if (cell.player > 0)
        counts[cell.player] = (counts[cell.player] ?? 0) + cell.orbs;
  return counts;
};

/** Returns every intermediate grid state: placement + one state per explosion wave. */
const computeWaves = (grid: Grid, r0: number, c0: number, player: number): Grid[] => {
  const states: Grid[] = [];
  let cur = cloneGrid(grid);
  cur[r0][c0].orbs += 1;
  cur[r0][c0].player = player;
  states.push(cloneGrid(cur));

  for (;;) {
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
        next[nr][nc].orbs += 1;
        next[nr][nc].player = player;
      }
    }
    cur = next;
    states.push(cloneGrid(cur));
  }
  return states;
};

// ─── Orb display ─────────────────────────────────────────────────────────────

const ORB_POSITIONS: [number, number][][] = [
  [],
  [[50, 50]],
  [[30, 50], [70, 50]],
  [[50, 28], [28, 68], [72, 68]],
  [[28, 28], [72, 28], [28, 72], [72, 72]],
];

const OrbDisplay: React.FC<{ count: number; color: string; size: number }> = ({ count, color, size }) => {
  const capped  = Math.min(count, 4);
  const pos     = ORB_POSITIONS[capped];
  const dotSize = size <= 44 ? 8 : size <= 54 ? 10 : 12;

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {pos.map(([x, y], i) => (
        <div
          key={i}
          className="orb-dot"
          style={{
            position: 'absolute',
            left: `${x}%`, top: `${y}%`,
            transform: 'translate(-50%, -50%)',
            width: dotSize, height: dotSize,
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 ${dotSize - 2}px ${color}`,
          }}
        />
      ))}
      {count > 4 && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color, fontSize: 13, fontWeight: 700, fontFamily: 'Montserrat, sans-serif',
        }}>
          {count}
        </div>
      )}
    </div>
  );
};

// ─── Main game component ──────────────────────────────────────────────────────

const ChainReactionGame: React.FC = () => {
  const [playerCount, setPlayerCount] = useState<2 | 3>(2);
  const [grid, setGrid]               = useState<Grid>(createGrid);
  const [currentPlayer, setCurrentPlayer] = useState<number>(1);
  const [activePlayers, setActivePlayers] = useState<number[]>([1, 2]);
  const [hasPlayed, setHasPlayed]     = useState<Set<number>>(new Set());
  const [gameOver, setGameOver]       = useState(false);
  const [winner, setWinner]           = useState(0);
  const [animating, setAnimating]     = useState(false);
  const [exploding, setExploding]     = useState<Set<string>>(new Set());
  const [hovered, setHovered]         = useState<string | null>(null);
  const [windowW, setWindowW]         = useState(window.innerWidth);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const onResize = () => setWindowW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => clearTimers, []);

  const cellSize = Math.min(Math.floor((windowW - 48) / COLS), 64);

  const finalise = useCallback((finalGrid: Grid, player: number, curActive: number[], curHasPlayed: Set<number>) => {
    const newHasPlayed = new Set([...curHasPlayed, player]);
    setHasPlayed(newHasPlayed);

    const orbCounts = countOrbsByPlayer(finalGrid);

    // Only start eliminating once every player has placed at least one orb
    const allHavePlayedOnce = curActive.every(p => newHasPlayed.has(p));

    const newActive = allHavePlayedOnce
      ? curActive.filter(p => (orbCounts[p] ?? 0) > 0)
      : [...curActive];

    setActivePlayers(newActive);

    if (newActive.length === 1) {
      setWinner(newActive[0]);
      setGameOver(true);
      return;
    }

    // Advance to next player in the (possibly reduced) active list
    const idx      = newActive.indexOf(player);
    const nextIdx  = idx === -1 ? 0 : (idx + 1) % newActive.length;
    setCurrentPlayer(newActive[nextIdx]);
  }, []);

  const handleClick = useCallback((r: number, c: number) => {
    if (animating || gameOver) return;
    const cell = grid[r][c];
    if (cell.player !== 0 && cell.player !== currentPlayer) return;

    const waves = computeWaves(grid, r, c, currentPlayer);
    clearTimers();

    // Capture current active/hasPlayed for closure
    const snapActive    = activePlayers;
    const snapHasPlayed = hasPlayed;

    if (waves.length === 1) {
      setGrid(waves[0]);
      finalise(waves[0], currentPlayer, snapActive, snapHasPlayed);
      return;
    }

    setAnimating(true);

    waves.forEach((waveGrid, i) => {
      const t = setTimeout(() => {
        setGrid(waveGrid);

        if (i < waves.length - 1) {
          const ex = new Set<string>();
          for (let row = 0; row < ROWS; row++)
            for (let col = 0; col < COLS; col++)
              if (waveGrid[row][col].orbs >= getCriticalMass(row, col))
                ex.add(`${row},${col}`);
          setExploding(ex);
        } else {
          setExploding(new Set());
          setAnimating(false);
          finalise(waveGrid, currentPlayer, snapActive, snapHasPlayed);
        }
      }, i * WAVE_DELAY);

      timersRef.current.push(t);
    });
  }, [grid, currentPlayer, gameOver, animating, activePlayers, hasPlayed, finalise]);

  const startNewGame = (count: 2 | 3 = playerCount) => {
    clearTimers();
    const players = Array.from({ length: count }, (_, i) => i + 1);
    setPlayerCount(count);
    setGrid(createGrid());
    setCurrentPlayer(1);
    setActivePlayers(players);
    setHasPlayed(new Set());
    setGameOver(false);
    setWinner(0);
    setAnimating(false);
    setExploding(new Set());
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1c1c1c',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: 'Montserrat, sans-serif',
      color: '#f5f0e8',
      padding: '28px 16px 40px',
      boxSizing: 'border-box',
    }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <a href="/" style={{
          color: '#c9a96e', textDecoration: 'none',
          fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.6,
        }}>
          ← Portfolio
        </a>
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(26px, 5vw, 40px)',
          fontWeight: 300, color: '#c9a96e',
          margin: '6px 0 0', letterSpacing: '0.06em',
        }}>
          Chain Reaction
        </h1>
      </div>

      {/* Player count selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {([2, 3] as const).map(n => (
          <button
            key={n}
            onClick={() => startNewGame(n)}
            style={{
              padding: '5px 18px',
              background: playerCount === n ? '#c9a96e22' : 'transparent',
              border: `1px solid ${playerCount === n ? '#c9a96e' : '#c9a96e44'}`,
              color: playerCount === n ? '#c9a96e' : '#c9a96e88',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 11,
              letterSpacing: '0.1em',
              fontFamily: 'Montserrat, sans-serif',
              transition: 'all 0.2s',
            }}
          >
            {n} Players
          </button>
        ))}
      </div>

      {/* Player indicators */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
        {Array.from({ length: playerCount }, (_, i) => i + 1).map(p => {
          const isActive   = currentPlayer === p && !gameOver;
          const eliminated = !activePlayers.includes(p) && hasPlayed.has(p);
          return (
            <div key={p} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 16px', borderRadius: 6,
              border: `1px solid ${isActive ? PLAYER_COLORS[p] : 'transparent'}`,
              background: isActive ? `${PLAYER_GLOW[p]}28` : 'transparent',
              opacity: eliminated ? 0.25 : 1,
              transition: 'all 0.25s ease',
              position: 'relative',
            }}>
              <div style={{
                width: 11, height: 11, borderRadius: '50%',
                background: PLAYER_COLORS[p],
                boxShadow: isActive ? `0 0 10px ${PLAYER_COLORS[p]}` : 'none',
                transition: 'box-shadow 0.25s',
              }} />
              <span style={{
                fontSize: 12, letterSpacing: '0.08em',
                opacity: isActive ? 1 : 0.4, transition: 'opacity 0.25s',
                textDecoration: eliminated ? 'line-through' : 'none',
              }}>
                {PLAYER_NAMES[p]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLS}, ${cellSize}px)`,
        gap: 3,
        background: '#232323',
        padding: 5,
        borderRadius: 10,
        boxShadow: '0 12px 48px rgba(0,0,0,0.55)',
        border: '1px solid #2e2e2e',
      }}>
        {grid.map((row, r) => row.map((cell, c) => {
          const key       = `${r},${c}`;
          const critMass  = getCriticalMass(r, c);
          const isExplode = exploding.has(key);
          const isHovered = hovered === key;
          const canClick  = !animating && !gameOver
            && (cell.player === 0 || cell.player === currentPlayer);
          const color     = cell.player ? PLAYER_COLORS[cell.player as 1|2|3] : '#555';
          const danger    = cell.orbs >= critMass - 1 && cell.orbs > 0;

          return (
            <div
              key={key}
              onClick={() => handleClick(r, c)}
              onMouseEnter={() => canClick && setHovered(key)}
              onMouseLeave={() => setHovered(null)}
              className={isExplode ? 'cell-explode' : ''}
              style={{
                width: cellSize, height: cellSize,
                borderRadius: 4,
                position: 'relative',
                cursor: canClick ? 'pointer' : 'default',
                boxSizing: 'border-box',
                background: isExplode
                  ? `${PLAYER_COLORS[currentPlayer as 1|2|3]}55`
                  : cell.player
                    ? `${PLAYER_COLORS[cell.player as 1|2|3]}14`
                    : isHovered ? '#2d2d2d' : '#262626',
                border: `1px solid ${
                  isExplode
                    ? PLAYER_COLORS[currentPlayer as 1|2|3]
                    : cell.player
                      ? `${PLAYER_COLORS[cell.player as 1|2|3]}${danger ? '99' : '44'}`
                      : isHovered
                        ? `${PLAYER_COLORS[currentPlayer as 1|2|3]}55`
                        : '#303030'
                }`,
                transition: 'background 0.1s, border-color 0.15s',
              }}
            >
              {cell.orbs > 0 && (
                <OrbDisplay count={cell.orbs} color={color} size={cellSize} />
              )}
              <div style={{
                position: 'absolute', bottom: 2, right: 3,
                fontSize: 8, opacity: 0.18, lineHeight: 1, userSelect: 'none',
              }}>
                {critMass}
              </div>
            </div>
          );
        }))}
      </div>

      {/* Status */}
      <div style={{ marginTop: 14, fontSize: 11, opacity: 0.4, letterSpacing: '0.1em', minHeight: 16 }}>
        {animating
          ? 'CHAIN REACTION…'
          : gameOver
            ? ''
            : `${PLAYER_NAMES[currentPlayer as 1|2|3]}'S TURN`}
      </div>

      {/* New Game button */}
      <button
        onClick={() => startNewGame()}
        style={{
          marginTop: 14,
          padding: '9px 28px',
          background: 'transparent',
          border: '1px solid #c9a96e55',
          color: '#c9a96e',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: 11,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontFamily: 'Montserrat, sans-serif',
          transition: 'background 0.2s, border-color 0.2s',
        }}
        onMouseOver={e => { e.currentTarget.style.background = '#c9a96e1a'; e.currentTarget.style.borderColor = '#c9a96e'; }}
        onMouseOut={e =>  { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#c9a96e55'; }}
      >
        New Game
      </button>

      {/* How to play */}
      <div style={{
        marginTop: 22, maxWidth: 340,
        fontSize: 11, opacity: 0.32, lineHeight: 1.8,
        textAlign: 'center', letterSpacing: '0.04em',
      }}>
        Click any empty cell or your own to place an orb. When a cell reaches its
        critical mass (corner=2, edge=3, center=4) it explodes — sending orbs to
        neighbors and converting them to your color. Last player with orbs wins.
      </div>

      {/* Win overlay */}
      {gameOver && winner > 0 && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(20,20,20,0.92)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, backdropFilter: 'blur(10px)',
        }}>
          <div style={{
            textAlign: 'center', padding: '48px 56px',
            background: '#222', borderRadius: 12,
            border: `1px solid ${PLAYER_COLORS[winner as 1|2|3]}55`,
            boxShadow: `0 24px 64px rgba(0,0,0,0.6), 0 0 48px ${PLAYER_GLOW[winner as 1|2|3]}`,
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: PLAYER_COLORS[winner as 1|2|3],
              margin: '0 auto 20px',
              boxShadow: `0 0 24px ${PLAYER_COLORS[winner as 1|2|3]}`,
              animation: 'orbPulse 1.2s ease-in-out infinite',
            }} />
            <h2 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 38, fontWeight: 300,
              color: PLAYER_COLORS[winner as 1|2|3],
              margin: '0 0 6px',
            }}>
              {PLAYER_NAMES[winner as 1|2|3]} Wins
            </h2>
            <p style={{
              fontSize: 10, opacity: 0.45, letterSpacing: '0.16em',
              margin: '0 0 32px', textTransform: 'uppercase',
            }}>
              Chain Reaction Complete
            </p>
            <button
              onClick={() => startNewGame()}
              style={{
                padding: '12px 40px',
                background: PLAYER_COLORS[winner as 1|2|3],
                border: 'none', color: '#1c1c1c',
                borderRadius: 4, cursor: 'pointer',
                fontSize: 11, letterSpacing: '0.14em',
                textTransform: 'uppercase', fontWeight: 700,
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      <style>{`
        .cell-explode { animation: cellBurst 0.18s ease-out; }
        .orb-dot      { animation: orbPop 0.2s cubic-bezier(.17,.67,.46,1.4) both; }
        @keyframes cellBurst {
          0%  { transform: scale(1);    }
          45% { transform: scale(1.18); }
          100%{ transform: scale(1);    }
        }
        @keyframes orbPop {
          0%  { transform: translate(-50%,-50%) scale(0);    opacity: 0; }
          60% { transform: translate(-50%,-50%) scale(1.25);             }
          100%{ transform: translate(-50%,-50%) scale(1);    opacity: 1; }
        }
        @keyframes orbPulse {
          0%,100%{ transform: scale(1);    opacity: 1;    }
          50%    { transform: scale(1.35); opacity: 0.75; }
        }
      `}</style>
    </div>
  );
};

export default ChainReactionGame;
