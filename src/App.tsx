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
      <section ref={(el) => { sectionRefs.current['RESUME'] = el; }} id="RESUME"
        style={{ padding: '100px 8%', backgroundColor: CREAM }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.22em', color: GOLD, marginBottom: '0.8rem', textAlign: 'center' }}>MY BACKGROUND</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.8rem', fontWeight: 400, textAlign: 'center', margin: '0 0 4rem' }}>Education & Experience</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
            {/* Education */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                <BookOpen size={20} color={GOLD} />
                <h3 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.16em' }}>EDUCATION</h3>
              </div>
              {content.resume.education.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '1.2rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: GOLD, flexShrink: 0, marginTop: '4px' }} />
                    {i < content.resume.education.length - 1 && <div style={{ width: '1px', flex: 1, backgroundColor: LIGHT_GOLD, marginTop: '6px' }} />}
                  </div>
                  <div style={{ paddingBottom: '1.5rem' }}>
                    <p style={{ margin: 0, fontSize: '0.65rem', color: GOLD, fontWeight: 600, letterSpacing: '0.1em' }}>{item.year}</p>
                    <p style={{ margin: '4px 0 2px', fontWeight: 600, fontSize: '1rem' }}>{item.title}</p>
                    <p style={{ margin: '0 0 6px', fontSize: '0.85rem', color: '#888' }}>{item.place}</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontFamily: "'Cormorant Garamond', serif", color: '#666', lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Experience */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                <Briefcase size={20} color={GOLD} />
                <h3 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.16em' }}>EXPERIENCE</h3>
              </div>
              {content.resume.experience.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '1.2rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: GOLD, flexShrink: 0, marginTop: '4px' }} />
                    {i < content.resume.experience.length - 1 && <div style={{ width: '1px', flex: 1, backgroundColor: LIGHT_GOLD, marginTop: '6px' }} />}
                  </div>
                  <div style={{ paddingBottom: '1.5rem' }}>
                    <p style={{ margin: 0, fontSize: '0.65rem', color: GOLD, fontWeight: 600, letterSpacing: '0.1em' }}>{item.year}</p>
                    <p style={{ margin: '4px 0 2px', fontWeight: 600, fontSize: '1rem' }}>{item.title}</p>
                    <p style={{ margin: '0 0 6px', fontSize: '0.85rem', color: '#888' }}>{item.place}</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontFamily: "'Cormorant Garamond', serif", color: '#666', lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div style={{ marginTop: '3rem', padding: '2.5rem', backgroundColor: '#fff', borderRadius: '20px' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 400, marginBottom: '1.8rem' }}>Core Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
              {content.resume.skills.map(skill => (
                <span key={skill} style={{ padding: '8px 18px', border: `1px solid ${LIGHT_GOLD}`, borderRadius: '999px', fontSize: '0.8rem', color: DARK, backgroundColor: CREAM }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

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
            {content.recommendations.items.map((rec, i) => (
              <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2.2rem', border: '1px solid rgba(201,169,110,0.2)' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '1.2rem' }}>
                  {[...Array(5)].map((_, s) => <Star key={s} size={14} fill={GOLD} color={GOLD} />)}
                </div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.8)', margin: '0 0 1.5rem', fontStyle: 'italic' }}>
                  "{rec.quote}"
                </p>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>{rec.name}</p>
                  <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: GOLD }}>{rec.role}</p>
                </div>
              </div>
            ))}
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
          {['LinkedIn', 'Instagram', 'Behance'].map(s => (
            <a key={s} href="#" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.72rem', letterSpacing: '0.1em' }}>{s.toUpperCase()}</a>
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
