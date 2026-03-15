import React, { useState, useEffect, useRef } from 'react';
import { Award, Briefcase, Mail, Phone, MapPin, ExternalLink, Star, Menu, X } from 'lucide-react';
import { signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { useContent } from './useContent';
import AdminPanel from './AdminPanel';

const ADMIN_EMAILS = ['johndave090909@gmail.com', 'Katriellamoglia2001@gmail.com'];

const GOLD = '#c9a96e';
const DARK = '#1c1c1c';
const CREAM = '#f5f0e8';
const LIGHT_GOLD = '#e8d9be';

const navLinks = ['HOME', 'ABOUT', 'RESUME', 'PORTFOLIO', 'CASE STUDY', 'RECOMMENDATIONS', 'CONTACT'];

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setWidth(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return width;
}

// ─── RESUME ─────────────────────────────────────────────────────────────────

function ResumeSection({ sectionRefs, content, isMobile }: {
  sectionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  content: any;
  isMobile: boolean;
}) {
  const [showFull, setShowFull] = useState(false);
  const r = content.resume;

  return (
    <section ref={(el) => { sectionRefs.current['RESUME'] = el; }} id="RESUME"
      style={{ padding: isMobile ? '60px 5%' : '100px 8%', backgroundColor: CREAM }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.22em', color: GOLD, marginBottom: '0.8rem', textAlign: 'center' }}>MY BACKGROUND</p>

        {/* Core Leadership Strengths */}
        <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: isMobile ? '1.5rem' : '2.5rem 3rem', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', color: GOLD, margin: '0 0 1.5rem' }}>CORE LEADERSHIP STRENGTHS</p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '0.8rem' }}>
            {(r.leadershipStrengths ?? []).map((strength: string, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '0.9rem 1rem', backgroundColor: CREAM, borderRadius: '10px' }}>
                <span style={{ color: GOLD, fontSize: '1rem', lineHeight: 1, marginTop: '2px', flexShrink: 0 }}>•</span>
                <span style={{ fontSize: '0.85rem', lineHeight: 1.5, color: DARK }}>{strength}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Toggle button */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button onClick={() => setShowFull(v => !v)} style={{
            padding: '12px 32px', backgroundColor: showFull ? CREAM : DARK, color: showFull ? DARK : '#fff',
            border: `1.5px solid ${DARK}`, borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700,
            letterSpacing: '0.12em', cursor: 'pointer', fontFamily: "'Montserrat', sans-serif", transition: 'all 0.2s',
          }}>{showFull ? 'HIDE FULL RESUME' : 'VIEW FULL RESUME'}</button>
        </div>

        {/* Full Resume */}
        {showFull && (
          <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: isMobile ? '1.5rem' : '3rem 3.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.07)' }}>
            {/* Header */}
            <div style={{ borderBottom: `2px solid ${DARK}`, paddingBottom: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? '1.4rem' : '2rem', fontWeight: 700, margin: '0 0 0.5rem', letterSpacing: '0.08em' }}>KATRIEL LAMOGLIA</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#666', letterSpacing: '0.04em', lineHeight: 1.7 }}>
                Laie, Hawaii &nbsp;|&nbsp; 385-244-7910 &nbsp;|&nbsp; katriellamoglia2001@gmail.com &nbsp;|&nbsp; LinkedIn Profile
              </p>
            </div>

            {/* Personal Brand */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.16em', color: DARK, borderBottom: `1px solid ${LIGHT_GOLD}`, paddingBottom: '0.5rem', marginBottom: '1rem' }}>PERSONAL BRAND</h3>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.05rem', lineHeight: 1.8, color: '#444', margin: 0 }}>{r.personalBrand}</p>
            </div>

            {/* Core Leadership Strengths */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.16em', color: DARK, borderBottom: `1px solid ${LIGHT_GOLD}`, paddingBottom: '0.5rem', marginBottom: '1rem' }}>CORE LEADERSHIP STRENGTHS</h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {(r.leadershipStrengths ?? []).map((strength: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: GOLD, flexShrink: 0 }}>•</span>
                    <span style={{ fontSize: '0.85rem', lineHeight: 1.5, color: '#444' }}>{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transformational Accomplishments */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.16em', color: DARK, borderBottom: `1px solid ${LIGHT_GOLD}`, paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>TRANSFORMATIONAL ACCOMPLISHMENTS</h3>
              {(r.accomplishments ?? []).map((acc: any, i: number) => (
                <div key={i} style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem', margin: '0 0 0.6rem', color: DARK }}>{acc.title}</p>
                  {acc.bullets.map((b: string, j: number) => (
                    <div key={j} style={{ display: 'flex', gap: '10px', marginBottom: '0.4rem' }}>
                      <span style={{ color: GOLD, flexShrink: 0 }}>•</span>
                      <p style={{ margin: 0, fontSize: '0.9rem', fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.7, color: '#444' }}>{b}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Professional Experience */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.16em', color: DARK, borderBottom: `1px solid ${LIGHT_GOLD}`, paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>PROFESSIONAL EXPERIENCE</h3>
              {(r.experience ?? []).map((exp: any, i: number) => (
                <div key={i} style={{ marginBottom: '1.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <p style={{ fontWeight: 700, fontSize: isMobile ? '0.9rem' : '1rem', margin: 0 }}>{exp.title}</p>
                    <p style={{ fontSize: '0.78rem', color: GOLD, margin: 0, fontWeight: 600 }}>{exp.period}</p>
                  </div>
                  <p style={{ margin: '2px 0 0.8rem', fontSize: '0.85rem', color: '#888' }}>{exp.company} — {exp.location}</p>
                  {exp.bullets.map((b: string, j: number) => (
                    <div key={j} style={{ display: 'flex', gap: '10px', marginBottom: '0.4rem' }}>
                      <span style={{ color: GOLD, flexShrink: 0 }}>•</span>
                      <p style={{ margin: 0, fontSize: '0.9rem', fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.7, color: '#444' }}>{b}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Credentials */}
            <div>
              <h3 style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.16em', color: DARK, borderBottom: `1px solid ${LIGHT_GOLD}`, paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>RELEVANT CREDENTIALS & SPECIALIZED TRAINING</h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: isMobile ? '1.5rem' : '2rem' }}>
                <div>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', color: GOLD, margin: '0 0 0.8rem' }}>EDUCATION</p>
                  {(r.credentials?.education ?? []).map((ed: any, i: number) => (
                    <div key={i} style={{ marginBottom: '0.8rem' }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem' }}>{ed.school}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#666', fontFamily: "'Cormorant Garamond', serif" }}>{ed.degree}</p>
                      {ed.period && <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: GOLD }}>{ed.period}</p>}
                    </div>
                  ))}
                </div>
                <div>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', color: GOLD, margin: '0 0 0.8rem' }}>CERTIFICATIONS</p>
                  {(r.credentials?.certifications ?? []).map((c: string, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '0.4rem' }}>
                      <span style={{ color: GOLD, flexShrink: 0 }}>•</span>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#444' }}>{c}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', color: GOLD, margin: '0 0 0.8rem' }}>LEADERSHIP & DEVELOPMENT</p>
                  {(r.credentials?.leadership ?? []).map((l: string, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '0.4rem' }}>
                      <span style={{ color: GOLD, flexShrink: 0 }}>•</span>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#444' }}>{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── MARQUEE ─────────────────────────────────────────────────────────────────

function MarqueeRow({ items, direction, imgW, imgH, gap }: {
  items: any[];
  direction: 1 | -1;
  imgW: number;
  imgH: number;
  gap: number;
}) {
  const itemW = imgW + gap;
  const innerRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(direction === 1 ? 0 : -(items.length * itemW));
  const isDragging = useRef(false);
  const lastXRef = useRef(0);
  const rafRef = useRef(0);
  const totalW = items.length * itemW;
  const doubled = [...items, ...items];

  useEffect(() => {
    posRef.current = direction === 1 ? 0 : -(items.length * itemW);
  }, [items.length, itemW, direction]);

  useEffect(() => {
    const tick = () => {
      if (!isDragging.current) posRef.current -= direction * 0.6;
      if (posRef.current <= -totalW) posRef.current += totalW;
      if (posRef.current >= 0) posRef.current -= totalW;
      if (innerRef.current) innerRef.current.style.transform = `translateX(${posRef.current}px)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [direction, totalW]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      posRef.current += e.clientX - lastXRef.current;
      lastXRef.current = e.clientX;
    };
    const onUp = () => { isDragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <div style={{ overflow: 'hidden', position: 'relative', marginBottom: `${gap}px`, cursor: 'grab' }}
      onMouseDown={(e) => { isDragging.current = true; lastXRef.current = e.clientX; e.preventDefault(); }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '60px', background: 'linear-gradient(to right, #fff, transparent)', zIndex: 1, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '60px', background: 'linear-gradient(to left, #fff, transparent)', zIndex: 1, pointerEvents: 'none' }} />
      <div ref={innerRef} style={{ display: 'flex', gap: `${gap}px`, width: 'max-content', willChange: 'transform' }}>
        {doubled.map((item, i) => {
          const cardInner = (
            <>
              <img src={item.img} alt={item.title} draggable={false}
                style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none', display: 'block' }} />
              <div className="mq-ov" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(28,28,28,0.72)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.25s', padding: '0 0.75rem', textAlign: 'center', pointerEvents: 'none' }}>
                <p style={{ margin: '0 0 4px', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.14em', color: GOLD }}>{(item.tag ?? '').toUpperCase()}</p>
                <p style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: '0.85rem', color: '#fff', lineHeight: 1.3 }}>{item.title}</p>
                {item.link && <ExternalLink size={12} color="#fff" style={{ marginTop: '6px' }} />}
              </div>
            </>
          );
          const boxStyle: React.CSSProperties = { position: 'relative', width: `${imgW}px`, height: `${imgH}px`, borderRadius: '10px', overflow: 'hidden', flexShrink: 0, display: 'block', textDecoration: 'none' };
          return item.link
            ? <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" style={boxStyle}
                onMouseEnter={e => { const ov = e.currentTarget.querySelector('.mq-ov') as HTMLElement; if (ov) ov.style.opacity = '1'; }}
                onMouseLeave={e => { const ov = e.currentTarget.querySelector('.mq-ov') as HTMLElement; if (ov) ov.style.opacity = '0'; }}
                onMouseDown={e => e.stopPropagation()}>
                {cardInner}
              </a>
            : <div key={i} style={boxStyle}
                onMouseEnter={e => { const ov = e.currentTarget.querySelector('.mq-ov') as HTMLElement; if (ov) ov.style.opacity = '1'; }}
                onMouseLeave={e => { const ov = e.currentTarget.querySelector('.mq-ov') as HTMLElement; if (ov) ov.style.opacity = '0'; }}>
                {cardInner}
              </div>;
        })}
      </div>
    </div>
  );
}

function MarqueeStrips({ items, isMobile }: { items: any[]; isMobile: boolean }) {
  const imgW = isMobile ? 150 : 220;
  const imgH = isMobile ? 110 : 160;
  const gap = isMobile ? 8 : 12;
  return (
    <div style={{ marginTop: '2.5rem' }}>
      <MarqueeRow items={items} direction={1} imgW={imgW} imgH={imgH} gap={gap} />
      <MarqueeRow items={items} direction={-1} imgW={imgW} imgH={imgH} gap={gap} />
    </div>
  );
}

// ─── PORTFOLIO ───────────────────────────────────────────────────────────────

function PortfolioSection({ sectionRefs, content, isMobile }: {
  sectionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  content: any;
  isMobile: boolean;
}) {
  const items = content.portfolio.items ?? [];
  return (
    <section ref={(el) => { sectionRefs.current['PORTFOLIO'] = el; }} id="PORTFOLIO"
      style={{ padding: isMobile ? '60px 5% 40px' : '100px 8% 60px', backgroundColor: '#fff' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.22em', color: GOLD, marginBottom: '0.8rem', textAlign: 'center' }}>MY WORK</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? '2rem' : '2.8rem', fontWeight: 400, textAlign: 'center', margin: '0 0 0.5rem' }}>Selected Projects</h2>
        {content.portfolio.description ? (
          <p style={{ textAlign: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: isMobile ? '1rem' : '1.1rem', color: '#666', lineHeight: 1.7, maxWidth: '600px', margin: '0.6rem auto 0' }}>{content.portfolio.description}</p>
        ) : null}
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#aaa', letterSpacing: '0.08em', margin: '0.5rem 0 0' }}>Drag to explore</p>
        {items.length > 0 && (
          <p style={{ textAlign: 'center', fontSize: '0.72rem', color: GOLD, fontWeight: 600, letterSpacing: '0.14em', margin: '0.3rem 0 0' }}>{items.length} {items.length === 1 ? 'PROJECT' : 'PROJECTS'}</p>
        )}
      </div>
      {items.length > 0 && <MarqueeStrips items={items} isMobile={isMobile} />}
    </section>
  );
}

// ─── CASE STUDY ──────────────────────────────────────────────────────────────

function CaseStudySection({ sectionRefs, content, isMobile }: {
  sectionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  content: any;
  isMobile: boolean;
}) {
  const [activeTab, setActiveTab] = useState(0);
  const items: any[] = content.caseStudies ?? [];
  const current = items[activeTab];

  if (!items.length) return null;
  if (activeTab >= items.length) setActiveTab(0);

  return (
    <section ref={(el) => { sectionRefs.current['CASE STUDY'] = el; }} id="CASE STUDY"
      style={{ padding: isMobile ? '60px 5%' : '100px 8%', backgroundColor: CREAM }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.22em', color: GOLD, marginBottom: '0.8rem', textAlign: 'center' }}>FEATURED WORK</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? '2rem' : '2.8rem', fontWeight: 400, textAlign: 'center', margin: '0 0 0.8rem' }}>Case Studies</h2>
        {(content as any).caseStudiesDescription ? (
          <p style={{ textAlign: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: isMobile ? '1rem' : '1.1rem', color: '#666', lineHeight: 1.7, maxWidth: '600px', margin: '0 auto 1.5rem' }}>{(content as any).caseStudiesDescription}</p>
        ) : <div style={{ marginBottom: '1.5rem' }} />}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
          {items.map((cs, i) => (
            <button key={i} onClick={() => setActiveTab(i)} style={{
              padding: isMobile ? '7px 14px' : '9px 20px',
              borderRadius: '999px', border: `1.5px solid ${activeTab === i ? GOLD : LIGHT_GOLD}`,
              backgroundColor: activeTab === i ? GOLD : 'transparent',
              color: activeTab === i ? '#fff' : DARK,
              fontSize: isMobile ? '0.65rem' : '0.75rem', fontWeight: 600, letterSpacing: '0.06em',
              cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'Montserrat', sans-serif",
            }}>{cs.label}</button>
          ))}
        </div>

        {current && (
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.07)', height: isMobile ? '480px' : '780px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '0.9rem 1.2rem', borderBottom: `1px solid ${LIGHT_GOLD}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? '0.95rem' : '1.1rem' }}>{current.label}</span>
              <a href={current.file} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', color: GOLD, textDecoration: 'none' }}>↓ DOWNLOAD</a>
            </div>
            <iframe key={activeTab} src={current.file} style={{ flex: 1, border: 'none', width: '100%' }} title={current.label} />
          </div>
        )}
      </div>
    </section>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [active, setActive] = useState('HOME');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const { content, loading, saveContent } = useContent();
  const width = useWindowWidth();
  const isMobile = width < 768;

  useEffect(() => { return onAuthStateChanged(auth, setUser); }, []);

  const isAdmin = user && ADMIN_EMAILS.map(e => e.toLowerCase()).includes((user.email ?? '').toLowerCase());
  const handleAdminLogin = () => signInWithPopup(auth, googleProvider);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const offsets = navLinks.map((id) => {
        const el = sectionRefs.current[id];
        if (!el) return { id, top: Infinity };
        return { id, top: Math.abs(el.getBoundingClientRect().top - 80) };
      });
      setActive(offsets.reduce((a, b) => (a.top < b.top ? a : b)).id);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = sectionRefs.current[id];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: CREAM, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', color: GOLD, letterSpacing: '0.1em' }}>Kate</span>
    </div>
  );

  return (
    <div style={{ backgroundColor: CREAM, color: DARK, fontFamily: "'Montserrat', sans-serif" }}>

      {/* NAVBAR */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        backgroundColor: scrolled || menuOpen ? 'rgba(245,240,232,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(8px)' : 'none',
        transition: 'all 0.3s ease',
        borderBottom: scrolled ? `1px solid ${LIGHT_GOLD}` : 'none',
      }}>
        <div style={{ padding: isMobile ? '16px 5%' : '18px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700, letterSpacing: '0.05em' }}>Kate</span>

          {isMobile ? (
            <button onClick={() => setMenuOpen(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: DARK }}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '2.2rem', alignItems: 'center' }}>
              {navLinks.map((link) => (
                <button key={link} onClick={() => scrollTo(link)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em',
                  color: active === link ? GOLD : DARK,
                  borderBottom: active === link ? `1px solid ${GOLD}` : '1px solid transparent',
                  paddingBottom: '2px', transition: 'color 0.2s', fontFamily: "'Montserrat', sans-serif",
                }}>{link}</button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile dropdown menu */}
        {isMobile && menuOpen && (
          <div style={{ padding: '0 5% 1.5rem', borderTop: `1px solid ${LIGHT_GOLD}`, display: 'flex', flexDirection: 'column', gap: '0' }}>
            {navLinks.map((link) => (
              <button key={link} onClick={() => scrollTo(link)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '14px 0', textAlign: 'left',
                fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.12em',
                color: active === link ? GOLD : DARK,
                borderBottom: `1px solid ${LIGHT_GOLD}`,
                fontFamily: "'Montserrat', sans-serif",
              }}>{link}</button>
            ))}
          </div>
        )}
      </nav>

      {/* HOME */}
      <section ref={(el) => { sectionRefs.current['HOME'] = el; }} id="HOME"
        style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: isMobile ? '100px 5% 60px' : '0 8%', paddingTop: isMobile ? '100px' : '80px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? '2.5rem' : '4rem',
          alignItems: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto',
        }}>
          {/* Text */}
          <div style={{ order: isMobile ? 2 : 1 }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.22em', color: GOLD, marginBottom: '1rem' }}>{content.hero.subtitle}</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", margin: 0, lineHeight: 1.05 }}>
              <span style={{ fontSize: isMobile ? '3rem' : 'clamp(4rem, 7vw, 6rem)', fontWeight: 400, display: 'block', color: DARK }}>{content.hero.firstName}</span>
              <span style={{ fontSize: isMobile ? '3rem' : 'clamp(4rem, 7vw, 6rem)', fontWeight: 400, fontStyle: 'italic', display: 'block', color: GOLD }}>{content.hero.lastName}</span>
            </h1>
            <p style={{ maxWidth: '380px', lineHeight: 1.75, color: '#555', margin: '1.4rem 0 2rem', fontFamily: "'Cormorant Garamond', serif", fontSize: isMobile ? '1rem' : '1.1rem' }}>
              {content.hero.description}
            </p>
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              <button onClick={() => scrollTo('PORTFOLIO')} style={{
                backgroundColor: DARK, color: '#fff', border: 'none', borderRadius: '999px',
                padding: isMobile ? '12px 22px' : '14px 28px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em',
                cursor: 'pointer', fontFamily: "'Montserrat', sans-serif",
              }}>VIEW MY WORK</button>
              <button onClick={() => scrollTo('CONTACT')} style={{
                backgroundColor: 'transparent', color: DARK, border: `1.5px solid ${DARK}`, borderRadius: '999px',
                padding: isMobile ? '12px 22px' : '14px 28px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em',
                cursor: 'pointer', fontFamily: "'Montserrat', sans-serif",
              }}>GET IN TOUCH</button>
            </div>
          </div>

          {/* Photo */}
          <div style={{ order: isMobile ? 1 : 2, position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: isMobile ? '220px' : '340px', height: isMobile ? '300px' : '480px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
              <img src={content.hero.imageUrl} alt={content.hero.firstName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            {!isMobile && (
              <>
                <div style={{ position: 'absolute', top: '24px', right: '-20px', backgroundColor: '#fff', borderRadius: '14px', padding: '12px 18px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: LIGHT_GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Award size={16} color={GOLD} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', color: '#999' }}>ACHIEVEMENT</p>
                    <p style={{ margin: 0, fontSize: '0.82rem', fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif", color: DARK }}>{content.hero.achievement}</p>
                  </div>
                </div>
                <div style={{ position: 'absolute', bottom: '30px', left: '-20px', backgroundColor: '#fff', borderRadius: '14px', padding: '12px 18px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '210px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: LIGHT_GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Briefcase size={16} color={GOLD} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', color: '#999' }}>EXPERIENCE</p>
                    <p style={{ margin: 0, fontSize: '0.82rem', fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif", color: GOLD }}>{content.hero.experienceLabel}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section ref={(el) => { sectionRefs.current['ABOUT'] = el; }} id="ABOUT"
        style={{ padding: isMobile ? '60px 5%' : '100px 8%', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '2.5rem' : '6rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: '20px', overflow: 'hidden' }}>
              <img src={content.about.imageUrl} alt="About" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ position: 'absolute', bottom: isMobile ? '-16px' : '-20px', right: isMobile ? '12px' : '-20px', backgroundColor: DARK, borderRadius: '16px', padding: isMobile ? '16px 20px' : '24px 28px', color: '#fff' }}>
              <p style={{ margin: 0, fontSize: isMobile ? '1.4rem' : '2rem', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{content.about.yearsExp}</p>
              <p style={{ margin: 0, fontSize: '0.65rem', letterSpacing: '0.1em', color: LIGHT_GOLD }}>YEARS EXPERIENCE</p>
            </div>
          </div>
          <div style={{ paddingBottom: isMobile ? '1rem' : '0' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.22em', color: GOLD, marginBottom: '1rem' }}>ELEVATOR PITCH</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? '2rem' : '2.8rem', fontWeight: 400, margin: '0 0 1.2rem', lineHeight: 1.2 }}>
              Crafting stories that <em style={{ color: GOLD }}>inspire</em>
            </h2>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: isMobile ? '1rem' : '1.15rem', lineHeight: 1.8, color: '#555', marginBottom: '1rem' }}>{content.about.bio1}</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: isMobile ? '1rem' : '1.15rem', lineHeight: 1.8, color: '#555', marginBottom: '1.5rem' }}>{content.about.bio2}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[['Major', content.about.major], ['University', content.about.university], ['Location', content.about.location]].map(([label, value]) => (
                <div key={label}>
                  <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', color: '#999' }}>{label.toUpperCase()}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.88rem', fontWeight: 500 }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RESUME */}
      <ResumeSection sectionRefs={sectionRefs} content={content} isMobile={isMobile} />

      {/* PORTFOLIO */}
      <PortfolioSection sectionRefs={sectionRefs} content={content} isMobile={isMobile} />

      {/* CASE STUDY */}
      <CaseStudySection sectionRefs={sectionRefs} content={content} isMobile={isMobile} />

      {/* RECOMMENDATIONS */}
      <section ref={(el) => { sectionRefs.current['RECOMMENDATIONS'] = el; }} id="RECOMMENDATIONS"
        style={{ padding: isMobile ? '60px 5%' : '100px 8%', backgroundColor: DARK, color: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.22em', color: GOLD, marginBottom: '0.8rem', textAlign: 'center' }}>WHAT THEY SAY</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? '2rem' : '2.8rem', fontWeight: 400, textAlign: 'center', margin: '0 0 2.5rem', color: '#fff' }}>Recommendations</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.2rem' }}>
            {content.recommendations.items.map((rec: any, i: number) => {
              const cardStyle: React.CSSProperties = { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: isMobile ? '1.5rem' : '2.2rem', border: '1px solid rgba(201,169,110,0.2)', display: 'block', textDecoration: 'none', color: 'inherit', transition: 'border-color 0.2s, transform 0.2s' };
              const inner = (
                <>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '1rem' }}>
                    {[...Array(5)].map((_, s) => <Star key={s} size={13} fill={GOLD} color={GOLD} />)}
                  </div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: isMobile ? '1rem' : '1.1rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.8)', margin: '0 0 1.2rem', fontStyle: 'italic' }}>
                    "{rec.quote}"
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{rec.name}</p>
                      <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: GOLD }}>{rec.role}</p>
                    </div>
                    {rec.link && <ExternalLink size={15} color={GOLD} />}
                  </div>
                </>
              );
              return rec.link
                ? <a key={i} href={rec.link} target="_blank" rel="noopener noreferrer" style={cardStyle}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = GOLD; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,110,0.2)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
                    {inner}
                  </a>
                : <div key={i} style={cardStyle}>{inner}</div>;
            })}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section ref={(el) => { sectionRefs.current['CONTACT'] = el; }} id="CONTACT"
        style={{ padding: isMobile ? '60px 5%' : '100px 8%', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.22em', color: GOLD, marginBottom: '0.8rem' }}>GET IN TOUCH</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? '2rem' : '2.8rem', fontWeight: 400, margin: '0 0 1rem' }}>Let's Work Together</h2>
          {content.contact.tagline && (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: isMobile ? '1rem' : '1.15rem', color: '#666', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto 2.5rem' }}>
              {content.contact.tagline}
            </p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { icon: <Mail size={18} color={GOLD} />, label: 'EMAIL', value: content.contact.email },
              { icon: <Phone size={18} color={GOLD} />, label: 'PHONE', value: content.contact.phone },
              { icon: <MapPin size={18} color={GOLD} />, label: 'LOCATION', value: content.contact.location },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{ padding: '1.4rem', backgroundColor: CREAM, borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.6rem' }}>{icon}</div>
                <p style={{ margin: '0 0 3px', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.14em', color: '#999' }}>{label}</p>
                <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 500 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: DARK, color: 'rgba(255,255,255,0.5)', padding: isMobile ? '2rem 5%' : '2.5rem 8%', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: 'center', gap: isMobile ? '1rem' : '0', fontSize: '0.75rem', letterSpacing: '0.08em', textAlign: isMobile ? 'center' : 'left' }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', color: '#fff' }}>Kate</span>
        <span style={{ fontSize: '0.7rem' }}>© 2025 Katriel Lamoglia. All rights reserved.</span>
        <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          {(content.contact.socials ?? []).filter((s: any) => s.url).map((s: any) => (
            <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
              style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.72rem', letterSpacing: '0.1em', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>
              {s.label.toUpperCase()}
            </a>
          ))}
          {isAdmin ? (
            <button onClick={() => setAdminOpen(true)} style={{ padding: '6px 14px', backgroundColor: GOLD, color: '#fff', border: 'none', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'inherit' }}>
              EDIT SITE
            </button>
          ) : (
            <button onClick={handleAdminLogin} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.1em' }}>
              ADMIN
            </button>
          )}
        </div>
      </footer>

      {adminOpen && isAdmin && (
        <AdminPanel content={content} onSave={saveContent} onClose={() => setAdminOpen(false)} />
      )}
    </div>
  );
}
