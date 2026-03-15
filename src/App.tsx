import React, { useState, useEffect, useRef } from 'react';
import { Award, Briefcase, Mail, Phone, MapPin, ExternalLink, ChevronDown, Star, BookOpen, Layers, MessageSquare } from 'lucide-react';
import { signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { useContent } from './useContent';
import AdminPanel from './AdminPanel';

// Authorized admin emails
const ADMIN_EMAILS = ['johndave090909@gmail.com', 'Katriellamoglia2001@gmail.com'];

const GOLD = '#c9a96e';
const DARK = '#1c1c1c';
const CREAM = '#f5f0e8';
const LIGHT_GOLD = '#e8d9be';

const navLinks = ['HOME', 'ABOUT', 'RESUME', 'PORTFOLIO', 'CASE STUDY', 'RECOMMENDATIONS', 'CONTACT'];

const caseStudies = [
  { label: 'Ciao Casa', file: '/CIAO CASA PPTX.pdf', type: 'pdf' },
  { label: 'Pure Pour', file: '/Empower your dream - PURE POUR.pdf', type: 'pdf' },
  { label: 'HTM Presentation', file: '/HTM PRESENTATION.pdf', type: 'pdf' },
  { label: 'HTM Restaurant', file: '/HTM RESTAURANT CONCEPT.pdf', type: 'pdf' },
  { label: 'Kasama Economics', file: '/KASAMA ECONOMICS FINAL KATE.pdf', type: 'pdf' },
  { label: "McDonald's Mix", file: '/Mcdonalds Marketing Mix (1).pdf', type: 'pdf' },
  { label: 'Team Menu', file: '/Team menu presentation (1).pdf', type: 'pdf' },
];

function ResumeSection({ sectionRefs, content }: { sectionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>, content: any }) {
  const [showFull, setShowFull] = useState(false);
  const r = content.resume;

  return (
    <section ref={(el) => { sectionRefs.current['RESUME'] = el; }} id="RESUME"
      style={{ padding: '100px 8%', backgroundColor: CREAM }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.22em', color: GOLD, marginBottom: '0.8rem', textAlign: 'center' }}>MY BACKGROUND</p>

        {/* Core Leadership Strengths */}
        <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '2.5rem 3rem', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', color: GOLD, margin: '0 0 1.5rem' }}>CORE LEADERSHIP STRENGTHS</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' }}>
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
          <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '3rem 3.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.07)' }}>
            {/* Header */}
            <div style={{ borderBottom: `2px solid ${DARK}`, paddingBottom: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, margin: '0 0 0.5rem', letterSpacing: '0.08em' }}>KATRIEL LAMOGLIA</h2>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#666', letterSpacing: '0.06em' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
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
                    <p style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>{exp.title}</p>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
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

function CaseStudySection({ sectionRefs }: { sectionRefs: React.MutableRefObject<Record<string, HTMLElement | null>> }) {
  const [activeTab, setActiveTab] = useState(0);
  const current = caseStudies[activeTab];
  const encodedFile = encodeURIComponent(window.location.origin + current.file);
  const src = current.type === 'pptx'
    ? `https://docs.google.com/gview?url=${encodedFile}&embedded=true`
    : current.file;

  return (
    <section ref={(el) => { sectionRefs.current['CASE STUDY'] = el; }} id="CASE STUDY"
      style={{ padding: '100px 8%', backgroundColor: CREAM }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.22em', color: GOLD, marginBottom: '0.8rem', textAlign: 'center' }}>FEATURED WORK</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.8rem', fontWeight: 400, textAlign: 'center', margin: '0 0 2.5rem' }}>Case Studies</h2>

        {/* Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center', marginBottom: '2rem' }}>
          {caseStudies.map((cs, i) => (
            <button key={i} onClick={() => setActiveTab(i)} style={{
              padding: '9px 20px', borderRadius: '999px', border: `1.5px solid ${activeTab === i ? GOLD : LIGHT_GOLD}`,
              backgroundColor: activeTab === i ? GOLD : 'transparent',
              color: activeTab === i ? '#fff' : DARK,
              fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em',
              cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: "'Montserrat', sans-serif",
            }}>{cs.label}</button>
          ))}
        </div>

        {/* Viewer */}
        <div style={{ backgroundColor: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.07)', height: '780px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${LIGHT_GOLD}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem' }}>{current.label}</span>
            <a href={current.file} download style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', color: GOLD, textDecoration: 'none' }}>↓ DOWNLOAD</a>
          </div>
          <iframe
            key={activeTab}
            src={src}
            style={{ flex: 1, border: 'none', width: '100%' }}
            title={current.label}
          />
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [active, setActive] = useState('HOME');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const { content, saveContent } = useContent();

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  const isAdmin = user && ADMIN_EMAILS.includes(user.email ?? '');
  const handleAdminLogin = () => signInWithPopup(auth, googleProvider);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const offsets = navLinks.map((id) => {
        const el = sectionRefs.current[id];
        if (!el) return { id, top: Infinity };
        return { id, top: Math.abs(el.getBoundingClientRect().top - 80) };
      });
      const closest = offsets.reduce((a, b) => (a.top < b.top ? a : b));
      setActive(closest.id);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = sectionRefs.current[id];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
  };

  return (
    <div style={{ backgroundColor: CREAM, color: DARK, fontFamily: "'Montserrat', sans-serif" }}>
      {/* NAVBAR */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        backgroundColor: scrolled ? 'rgba(245,240,232,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(8px)' : 'none',
        transition: 'all 0.3s ease',
        borderBottom: scrolled ? `1px solid ${LIGHT_GOLD}` : 'none',
        padding: '18px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700, letterSpacing: '0.05em' }}>Kate</span>
        <div style={{ display: 'flex', gap: '2.2rem', alignItems: 'center' }}>
          {navLinks.map((link) => (
            <button key={link} onClick={() => scrollTo(link)} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em',
              color: active === link ? GOLD : DARK,
              borderBottom: active === link ? `1px solid ${GOLD}` : '1px solid transparent',
              paddingBottom: '2px',
              transition: 'color 0.2s',
              fontFamily: "'Montserrat', sans-serif",
            }}>{link}</button>
          ))}
        </div>
      </nav>

      {/* HOME */}
      <section ref={(el) => { sectionRefs.current['HOME'] = el; }} id="HOME"
        style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '0 8% 0 8%', paddingTop: '80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          {/* Left */}
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.22em', color: GOLD, marginBottom: '1.5rem' }}>{content.hero.subtitle}</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", margin: 0, lineHeight: 1.05 }}>
              <span style={{ fontSize: 'clamp(4rem, 7vw, 6rem)', fontWeight: 400, display: 'block', color: DARK }}>{content.hero.firstName}</span>
              <span style={{ fontSize: 'clamp(4rem, 7vw, 6rem)', fontWeight: 400, fontStyle: 'italic', display: 'block', color: GOLD }}>{content.hero.lastName}</span>
            </h1>
            <p style={{ maxWidth: '380px', lineHeight: 1.75, color: '#555', margin: '1.8rem 0 2.4rem', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem' }}>
              {content.hero.description}
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => scrollTo('PORTFOLIO')} style={{
                backgroundColor: DARK, color: '#fff', border: 'none', borderRadius: '999px',
                padding: '14px 28px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em',
                cursor: 'pointer', transition: 'background 0.2s',
                fontFamily: "'Montserrat', sans-serif",
              }}>VIEW MY WORK</button>
              <button onClick={() => scrollTo('CONTACT')} style={{
                backgroundColor: 'transparent', color: DARK, border: `1.5px solid ${DARK}`, borderRadius: '999px',
                padding: '14px 28px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em',
                cursor: 'pointer', transition: 'all 0.2s',
                fontFamily: "'Montserrat', sans-serif",
              }}>GET IN TOUCH</button>
            </div>
          </div>

          {/* Right — photo + floating cards */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '340px', height: '480px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
              <img src={content.hero.imageUrl} alt={content.hero.firstName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            {/* Achievement card */}
            <div style={{
              position: 'absolute', top: '24px', right: '-20px',
              backgroundColor: '#fff', borderRadius: '14px', padding: '12px 18px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px',
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: LIGHT_GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Award size={16} color={GOLD} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', color: '#999' }}>ACHIEVEMENT</p>
                <p style={{ margin: 0, fontSize: '0.82rem', fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif", color: DARK }}>{content.hero.achievement}</p>
              </div>
            </div>
            {/* Experience card */}
            <div style={{
              position: 'absolute', bottom: '30px', left: '-20px',
              backgroundColor: '#fff', borderRadius: '14px', padding: '12px 18px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '210px',
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: LIGHT_GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Briefcase size={16} color={GOLD} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', color: '#999' }}>EXPERIENCE</p>
                <p style={{ margin: 0, fontSize: '0.82rem', fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif", color: GOLD }}>{content.hero.experienceLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section ref={(el) => { sectionRefs.current['ABOUT'] = el; }} id="ABOUT"
        style={{ padding: '100px 8%', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: '20px', overflow: 'hidden' }}>
              <img src={content.about.imageUrl} alt="About" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', backgroundColor: DARK, borderRadius: '16px', padding: '24px 28px', color: '#fff' }}>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{content.about.yearsExp}</p>
              <p style={{ margin: 0, fontSize: '0.72rem', letterSpacing: '0.1em', color: LIGHT_GOLD }}>YEARS EXPERIENCE</p>
            </div>
          </div>
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.22em', color: GOLD, marginBottom: '1rem' }}>ABOUT ME</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.8rem', fontWeight: 400, margin: '0 0 1.5rem', lineHeight: 1.2 }}>
              Crafting stories that <em style={{ color: GOLD }}>inspire</em>
            </h2>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem', lineHeight: 1.8, color: '#555', marginBottom: '1.2rem' }}>
              {content.about.bio1}
            </p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem', lineHeight: 1.8, color: '#555', marginBottom: '2rem' }}>
              {content.about.bio2}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[['Major', content.about.major], ['University', content.about.university], ['Graduation', content.about.graduation], ['Location', content.about.location]].map(([label, value]) => (
                <div key={label}>
                  <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', color: '#999' }}>{label.toUpperCase()}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.95rem', fontWeight: 500 }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RESUME */}
      <ResumeSection sectionRefs={sectionRefs} content={content} />

      {/* PORTFOLIO */}
      <section ref={(el) => { sectionRefs.current['PORTFOLIO'] = el; }} id="PORTFOLIO"
        style={{ padding: '100px 8%', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.22em', color: GOLD, marginBottom: '0.8rem', textAlign: 'center' }}>MY WORK</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.8rem', fontWeight: 400, textAlign: 'center', margin: '0 0 3.5rem' }}>Selected Projects</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.8rem' }}>
            {content.portfolio.items.map((item, i) => (
              <div key={i} style={{ borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', position: 'relative', aspectRatio: '4/3', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                onMouseEnter={e => { (e.currentTarget.querySelector('.overlay') as HTMLElement).style.opacity = '1'; }}
                onMouseLeave={e => { (e.currentTarget.querySelector('.overlay') as HTMLElement).style.opacity = '0'; }}>
                <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="overlay" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(28,28,28,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.14em', color: GOLD }}>{item.tag.toUpperCase()}</p>
                  <p style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', color: '#fff', textAlign: 'center', padding: '0 1rem' }}>{item.title}</p>
                  <ExternalLink size={16} color="#fff" style={{ marginTop: '12px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CASE STUDY */}
      <CaseStudySection sectionRefs={sectionRefs} />

      {/* RECOMMENDATIONS */}
      <section ref={(el) => { sectionRefs.current['RECOMMENDATIONS'] = el; }} id="RECOMMENDATIONS"
        style={{ padding: '100px 8%', backgroundColor: DARK, color: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.22em', color: GOLD, marginBottom: '0.8rem', textAlign: 'center' }}>WHAT THEY SAY</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.8rem', fontWeight: 400, textAlign: 'center', margin: '0 0 4rem', color: '#fff' }}>Recommendations</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.8rem' }}>
            {content.recommendations.items.map((rec, i) => {
              const cardStyle: React.CSSProperties = { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2.2rem', border: '1px solid rgba(201,169,110,0.2)', display: 'block', textDecoration: 'none', color: 'inherit', transition: 'border-color 0.2s, transform 0.2s' };
              const inner = (
                <>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '1.2rem' }}>
                    {[...Array(5)].map((_, s) => <Star key={s} size={14} fill={GOLD} color={GOLD} />)}
                  </div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.8)', margin: '0 0 1.5rem', fontStyle: 'italic' }}>
                    "{rec.quote}"
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>{rec.name}</p>
                      <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: GOLD }}>{rec.role}</p>
                    </div>
                    {rec.link && <ExternalLink size={16} color={GOLD} />}
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
        style={{ padding: '100px 8%', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.22em', color: GOLD, marginBottom: '0.8rem' }}>GET IN TOUCH</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.8rem', fontWeight: 400, margin: '0 0 1rem' }}>Let's Work Together</h2>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem', color: '#666', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto 3rem' }}>
            I'm open to internship opportunities, brand collaborations, and creative partnerships. Don't hesitate to reach out.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
            {[
              { icon: <Mail size={20} color={GOLD} />, label: 'EMAIL', value: content.contact.email },
              { icon: <Phone size={20} color={GOLD} />, label: 'PHONE', value: content.contact.phone },
              { icon: <MapPin size={20} color={GOLD} />, label: 'LOCATION', value: content.contact.location },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{ padding: '1.8rem', backgroundColor: CREAM, borderRadius: '16px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.8rem' }}>{icon}</div>
                <p style={{ margin: '0 0 4px', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', color: '#999' }}>{label}</p>
                <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500 }}>{value}</p>
              </div>
            ))}
          </div>
          <form onSubmit={e => e.preventDefault()} style={{ display: 'grid', gap: '1rem', textAlign: 'left' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {['Your Name', 'Your Email'].map(ph => (
                <input key={ph} placeholder={ph} style={{ padding: '14px 18px', border: `1px solid ${LIGHT_GOLD}`, borderRadius: '10px', fontSize: '0.9rem', backgroundColor: CREAM, outline: 'none', fontFamily: "'Montserrat', sans-serif" }} />
              ))}
            </div>
            <input placeholder="Subject" style={{ padding: '14px 18px', border: `1px solid ${LIGHT_GOLD}`, borderRadius: '10px', fontSize: '0.9rem', backgroundColor: CREAM, outline: 'none', fontFamily: "'Montserrat', sans-serif" }} />
            <textarea placeholder="Your message..." rows={5} style={{ padding: '14px 18px', border: `1px solid ${LIGHT_GOLD}`, borderRadius: '10px', fontSize: '0.9rem', backgroundColor: CREAM, outline: 'none', resize: 'vertical', fontFamily: "'Montserrat', sans-serif" }} />
            <button type="submit" style={{ backgroundColor: DARK, color: '#fff', border: 'none', borderRadius: '999px', padding: '16px 40px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', cursor: 'pointer', alignSelf: 'center', justifySelf: 'center', fontFamily: "'Montserrat', sans-serif" }}>
              SEND MESSAGE
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: DARK, color: 'rgba(255,255,255,0.5)', padding: '2.5rem 8%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', letterSpacing: '0.08em' }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', color: '#fff' }}>Kate</span>
        <span>© 2025 Katriel Lamoglia. All rights reserved.</span>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {(content.contact.socials ?? []).filter((s: any) => s.url).map((s: any) => (
            <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.72rem', letterSpacing: '0.1em', transition: 'color 0.2s' }}
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
