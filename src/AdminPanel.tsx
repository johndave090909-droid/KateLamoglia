import React, { useState, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from './firebase';
import { SiteContent } from './defaultContent';

const GOLD = '#c9a96e';
const DARK = '#1c1c1c';
const CREAM = '#f5f0e8';
const LIGHT_GOLD = '#e8d9be';

const tabs = ['Hero', 'About', 'Resume', 'Portfolio', 'Case Studies', 'Recommendations', 'Contact'];

interface Props {
  content: SiteContent;
  onSave: (c: SiteContent) => Promise<void>;
  onClose: () => void;
}

export default function AdminPanel({ content, onSave, onClose }: Props) {
  const [activeTab, setActiveTab] = useState('Hero');
  const [draft, setDraft] = useState<SiteContent>(JSON.parse(JSON.stringify(content)));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (section: keyof SiteContent, key: string, value: any) => {
    setDraft(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const uploadImage = async (path: string, file: File, onUrl: (url: string) => void) => {
    setUploading(path);
    const storageRef = ref(storage, `site/${path}-${Date.now()}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    onUrl(url);
    setUploading(null);
  };

  const input = (label: string, value: string, onChange: (v: string) => void, multiline = false) => (
    <div style={{ marginBottom: '1.2rem' }}>
      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888', marginBottom: '6px' }}>{label.toUpperCase()}</label>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={4}
          style={{ width: '100%', padding: '10px 14px', border: `1px solid ${LIGHT_GOLD}`, borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', border: `1px solid ${LIGHT_GOLD}`, borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
      )}
    </div>
  );

  const imageUpload = (label: string, currentUrl: string, storagePath: string, onUrl: (url: string) => void) => (
    <div style={{ marginBottom: '1.2rem' }}>
      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888', marginBottom: '6px' }}>{label.toUpperCase()}</label>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {currentUrl && <img src={currentUrl} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />}
        <label style={{ cursor: 'pointer', padding: '8px 16px', border: `1.5px dashed ${LIGHT_GOLD}`, borderRadius: '8px', fontSize: '0.78rem', color: DARK }}>
          {uploading === storagePath ? 'Uploading...' : 'Choose Image'}
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
            const file = e.target.files?.[0];
            if (file) uploadImage(storagePath, file, onUrl);
          }} />
        </label>
        <input value={currentUrl} onChange={e => onUrl(e.target.value)} placeholder="or paste image URL"
          style={{ flex: 1, padding: '8px 12px', border: `1px solid ${LIGHT_GOLD}`, borderRadius: '8px', fontSize: '0.82rem', outline: 'none' }} />
      </div>
    </div>
  );

  const renderHero = () => (
    <div>
      <div style={{ marginBottom: '0.8rem' }}>
        <label style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888' }}>BACKGROUND MUSIC URL (.mp3 or audio link)</label>
        <input value={(draft as any).music?.url ?? ''} onChange={e => setDraft(prev => ({ ...prev, music: { url: e.target.value } } as any))}
          placeholder="https://... or /music.mp3"
          style={{ display: 'block', width: '100%', padding: '7px 12px', border: `1px solid ${LIGHT_GOLD}`, borderRadius: '6px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', marginTop: '4px' }} />
        <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: '#aaa' }}>Upload the .mp3 to /public or use a direct audio URL. Leave blank to disable.</p>
      </div>
      {input('First Name', draft.hero.firstName, v => update('hero', 'firstName', v))}
      {input('Last Name', draft.hero.lastName, v => update('hero', 'lastName', v))}
      {input('Subtitle (e.g. CLASS OF 2026)', draft.hero.subtitle, v => update('hero', 'subtitle', v))}
      {input('Description', draft.hero.description, v => update('hero', 'description', v), true)}
      {input('Achievement Text', draft.hero.achievement, v => update('hero', 'achievement', v))}
      {input('Experience Label', draft.hero.experienceLabel, v => update('hero', 'experienceLabel', v))}
      {imageUpload('Hero Image', draft.hero.imageUrl, 'hero', url => update('hero', 'imageUrl', url))}
    </div>
  );

  const renderAbout = () => (
    <div>
      {input('Bio Paragraph 1', draft.about.bio1, v => update('about', 'bio1', v), true)}
      {input('Bio Paragraph 2', draft.about.bio2, v => update('about', 'bio2', v), true)}
      {input('Major', draft.about.major, v => update('about', 'major', v))}
      {input('University', draft.about.university, v => update('about', 'university', v))}
      {input('Graduation', draft.about.graduation, v => update('about', 'graduation', v))}
      {input('Location', draft.about.location, v => update('about', 'location', v))}
      {input('Years of Experience', draft.about.yearsExp, v => update('about', 'yearsExp', v))}
      {imageUpload('About Image', draft.about.imageUrl, 'about', url => update('about', 'imageUrl', url))}
    </div>
  );

  const renderResume = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em' }}>CORE LEADERSHIP STRENGTHS</h4>
        <button onClick={() => update('resume', 'leadershipStrengths', [...draft.resume.leadershipStrengths, ''])}
          style={{ padding: '6px 14px', backgroundColor: GOLD, color: '#fff', border: 'none', borderRadius: '999px', fontSize: '0.72rem', cursor: 'pointer' }}>+ Add</button>
      </div>
      {draft.resume.leadershipStrengths.map((strength, i) => (
        <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.6rem' }}>
          <span style={{ color: GOLD, fontSize: '1rem', flexShrink: 0 }}>•</span>
          <input value={strength} onChange={e => {
            const u = [...draft.resume.leadershipStrengths];
            u[i] = e.target.value;
            update('resume', 'leadershipStrengths', u);
          }} style={{ flex: 1, padding: '7px 12px', border: `1px solid ${LIGHT_GOLD}`, borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} />
          <button onClick={() => update('resume', 'leadershipStrengths', draft.resume.leadershipStrengths.filter((_, j) => j !== i))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '1rem', flexShrink: 0 }}>✕</button>
        </div>
      ))}
    </div>
  );

  const renderPortfolio = () => (
    <div>
      <div style={{ marginBottom: '1.2rem' }}>
        <label style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888' }}>DESCRIPTION (shown below section title)</label>
        <textarea value={draft.portfolio.description ?? ''} onChange={e => update('portfolio', 'description', e.target.value)}
          rows={3} placeholder="Optional intro text under 'Selected Projects'..."
          style={{ display: 'block', width: '100%', padding: '7px 12px', border: `1px solid ${LIGHT_GOLD}`, borderRadius: '6px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', marginTop: '4px', resize: 'vertical', fontFamily: 'inherit' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em' }}>PORTFOLIO ITEMS</h4>
        <button onClick={() => update('portfolio', 'items', [...draft.portfolio.items, { title: '', tag: '', img: '', link: '' }])}
          style={{ padding: '6px 14px', backgroundColor: GOLD, color: '#fff', border: 'none', borderRadius: '999px', fontSize: '0.72rem', cursor: 'pointer' }}>+ Add Item</button>
      </div>
      {draft.portfolio.items.map((item, i) => (
        <div key={i} style={{ backgroundColor: CREAM, borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem', position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          <button onClick={() => update('portfolio', 'items', draft.portfolio.items.filter((_, j) => j !== i))}
            style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '1rem' }}>✕</button>
          <div>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888' }}>TITLE</label>
            <input value={item.title} onChange={e => { const u = [...draft.portfolio.items]; u[i].title = e.target.value; update('portfolio', 'items', u); }}
              style={{ display: 'block', width: '100%', padding: '7px 12px', border: `1px solid ${LIGHT_GOLD}`, borderRadius: '6px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', marginTop: '4px' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888' }}>TAG</label>
            <input value={item.tag} onChange={e => { const u = [...draft.portfolio.items]; u[i].tag = e.target.value; update('portfolio', 'items', u); }}
              style={{ display: 'block', width: '100%', padding: '7px 12px', border: `1px solid ${LIGHT_GOLD}`, borderRadius: '6px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', marginTop: '4px' }} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888' }}>LINK URL</label>
            <input value={item.link ?? ''} onChange={e => { const u = [...draft.portfolio.items]; u[i].link = e.target.value; update('portfolio', 'items', u); }}
              placeholder="https://..." style={{ display: 'block', width: '100%', padding: '7px 12px', border: `1px solid ${LIGHT_GOLD}`, borderRadius: '6px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', marginTop: '4px' }} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888' }}>IMAGE</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '4px' }}>
              {item.img && <img src={item.img} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />}
              <label style={{ cursor: 'pointer', padding: '6px 12px', border: `1.5px dashed ${LIGHT_GOLD}`, borderRadius: '6px', fontSize: '0.75rem' }}>
                {uploading === `portfolio-${i}` ? 'Uploading...' : 'Upload'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) uploadImage(`portfolio-${i}`, file, url => { const u = [...draft.portfolio.items]; u[i].img = url; update('portfolio', 'items', u); });
                }} />
              </label>
              <input value={item.img} onChange={e => { const u = [...draft.portfolio.items]; u[i].img = e.target.value; update('portfolio', 'items', u); }}
                placeholder="or paste URL" style={{ flex: 1, padding: '6px 10px', border: `1px solid ${LIGHT_GOLD}`, borderRadius: '6px', fontSize: '0.8rem', outline: 'none' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderRecommendations = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em' }}>RECOMMENDATIONS</h4>
        <button onClick={() => update('recommendations', 'items', [...draft.recommendations.items, { name: '', role: '', quote: '', link: '' }])}
          style={{ padding: '6px 14px', backgroundColor: GOLD, color: '#fff', border: 'none', borderRadius: '999px', fontSize: '0.72rem', cursor: 'pointer' }}>+ Add</button>
      </div>
      {draft.recommendations.items.map((item, i) => (
        <div key={i} style={{ backgroundColor: CREAM, borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem', position: 'relative' }}>
          <button onClick={() => update('recommendations', 'items', draft.recommendations.items.filter((_, j) => j !== i))}
            style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '1rem' }}>✕</button>
          {[['name', 'Name'], ['role', 'Role / Title'], ['quote', 'Quote']].map(([field, label]) => (
            <div key={field} style={{ marginBottom: '0.6rem' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888' }}>{label.toUpperCase()}</label>
              {field === 'quote' ? (
                <textarea value={(item as any)[field]} onChange={e => { const u = [...draft.recommendations.items]; (u[i] as any)[field] = e.target.value; update('recommendations', 'items', u); }} rows={3}
                  style={{ display: 'block', width: '100%', padding: '7px 12px', border: `1px solid ${LIGHT_GOLD}`, borderRadius: '6px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', marginTop: '4px', resize: 'vertical', fontFamily: 'inherit' }} />
              ) : (
                <input value={(item as any)[field]} onChange={e => { const u = [...draft.recommendations.items]; (u[i] as any)[field] = e.target.value; update('recommendations', 'items', u); }}
                  style={{ display: 'block', width: '100%', padding: '7px 12px', border: `1px solid ${LIGHT_GOLD}`, borderRadius: '6px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', marginTop: '4px' }} />
              )}
            </div>
          ))}
          {/* PDF / Link field */}
          <div style={{ marginBottom: '0.6rem' }}>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888' }}>LETTER OF RECOMMENDATION (PDF)</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '4px' }}>
              <label style={{ cursor: 'pointer', padding: '7px 14px', border: `1.5px dashed ${LIGHT_GOLD}`, borderRadius: '6px', fontSize: '0.75rem', whiteSpace: 'nowrap', color: DARK }}>
                {uploading === `rec-pdf-${i}` ? 'Uploading...' : '↑ Upload PDF'}
                <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) uploadImage(`rec-pdf-${i}`, file, url => {
                    const u = [...draft.recommendations.items];
                    (u[i] as any).link = url;
                    update('recommendations', 'items', u);
                  });
                }} />
              </label>
              <input value={(item as any).link || ''} onChange={e => { const u = [...draft.recommendations.items]; (u[i] as any).link = e.target.value; update('recommendations', 'items', u); }}
                placeholder="or paste URL"
                style={{ flex: 1, padding: '7px 12px', border: `1px solid ${LIGHT_GOLD}`, borderRadius: '6px', fontSize: '0.82rem', outline: 'none' }} />
              {(item as any).link && (
                <a href={(item as any).link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: GOLD, whiteSpace: 'nowrap' }}>View</a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderContact = () => {
    const socials = (draft.contact as any).socials ?? [];
    return (
      <div>
        <div style={{ marginBottom: '0.8rem' }}>
          <label style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888' }}>TAGLINE (shown under "Let's Work Together")</label>
          <textarea value={(draft.contact as any).tagline ?? ''} onChange={e => update('contact', 'tagline', e.target.value)}
            rows={3} placeholder="I'm open to internship opportunities..."
            style={{ display: 'block', width: '100%', padding: '7px 12px', border: `1px solid ${LIGHT_GOLD}`, borderRadius: '6px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', marginTop: '4px', resize: 'vertical', fontFamily: 'inherit' }} />
        </div>
        {input('Email', draft.contact.email, v => update('contact', 'email', v))}
        {input('Phone', draft.contact.phone, v => update('contact', 'phone', v))}
        {input('Location', draft.contact.location, v => update('contact', 'location', v))}

        {/* Social Links */}
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888' }}>SOCIAL LINKS</label>
            <button onClick={() => update('contact', 'socials', [...socials, { label: '', url: '' }])}
              style={{ padding: '6px 14px', backgroundColor: GOLD, color: '#fff', border: 'none', borderRadius: '999px', fontSize: '0.72rem', cursor: 'pointer' }}>+ Add</button>
          </div>
          {socials.map((s: any, i: number) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.6rem' }}>
              <input value={s.label} onChange={e => { const u = [...socials]; u[i].label = e.target.value; update('contact', 'socials', u); }}
                placeholder="Label (e.g. LinkedIn)"
                style={{ width: '120px', padding: '8px 12px', border: `1px solid ${LIGHT_GOLD}`, borderRadius: '6px', fontSize: '0.82rem', outline: 'none' }} />
              <input value={s.url} onChange={e => { const u = [...socials]; u[i].url = e.target.value; update('contact', 'socials', u); }}
                placeholder="https://..."
                style={{ flex: 1, padding: '8px 12px', border: `1px solid ${LIGHT_GOLD}`, borderRadius: '6px', fontSize: '0.82rem', outline: 'none' }} />
              <button onClick={() => update('contact', 'socials', socials.filter((_: any, j: number) => j !== i))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '1rem', flexShrink: 0 }}>✕</button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCaseStudies = () => {
    const items: any[] = (draft as any).caseStudies ?? [];
    return (
      <div>
        <div style={{ marginBottom: '1.2rem' }}>
          <label style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888' }}>DESCRIPTION (shown below section title)</label>
          <textarea value={(draft as any).caseStudiesDescription ?? ''} onChange={e => setDraft(prev => ({ ...prev, caseStudiesDescription: e.target.value } as any))}
            rows={3} placeholder="Optional intro text under 'Case Studies'..."
            style={{ display: 'block', width: '100%', padding: '7px 12px', border: `1px solid ${LIGHT_GOLD}`, borderRadius: '6px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', marginTop: '4px', resize: 'vertical', fontFamily: 'inherit' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em' }}>CASE STUDIES</h4>
          <button onClick={() => { const u = [...items, { label: '', file: '' }]; setDraft(prev => ({ ...prev, caseStudies: u } as any)); }}
            style={{ padding: '6px 14px', backgroundColor: GOLD, color: '#fff', border: 'none', borderRadius: '999px', fontSize: '0.72rem', cursor: 'pointer' }}>+ Add</button>
        </div>
        {items.map((cs: any, i: number) => (
          <div key={i} style={{ backgroundColor: CREAM, borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem', position: 'relative' }}>
            <button onClick={() => setDraft(prev => ({ ...prev, caseStudies: items.filter((_: any, j: number) => j !== i) } as any))}
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '1rem' }}>✕</button>
            <div style={{ marginBottom: '0.6rem' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888' }}>TAB LABEL</label>
              <input value={cs.label} onChange={e => { const u = [...items]; u[i].label = e.target.value; setDraft(prev => ({ ...prev, caseStudies: u } as any)); }}
                style={{ display: 'block', width: '100%', padding: '7px 12px', border: `1px solid ${LIGHT_GOLD}`, borderRadius: '6px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', marginTop: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888' }}>PDF FILE</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '4px' }}>
                <label style={{ cursor: 'pointer', padding: '7px 14px', border: `1.5px dashed ${LIGHT_GOLD}`, borderRadius: '6px', fontSize: '0.75rem', whiteSpace: 'nowrap', color: DARK }}>
                  {uploading === `cs-pdf-${i}` ? 'Uploading...' : '↑ Upload PDF'}
                  <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) uploadImage(`cs-pdf-${i}`, file, url => {
                      const u = [...items]; u[i].file = url;
                      setDraft(prev => ({ ...prev, caseStudies: u } as any));
                    });
                  }} />
                </label>
                <input value={cs.file} onChange={e => { const u = [...items]; u[i].file = e.target.value; setDraft(prev => ({ ...prev, caseStudies: u } as any)); }}
                  placeholder="or paste URL"
                  style={{ flex: 1, padding: '7px 12px', border: `1px solid ${LIGHT_GOLD}`, borderRadius: '6px', fontSize: '0.82rem', outline: 'none' }} />
                {cs.file && <a href={cs.file} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: GOLD, whiteSpace: 'nowrap' }}>View</a>}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'Hero': return renderHero();
      case 'About': return renderAbout();
      case 'Resume': return renderResume();
      case 'Portfolio': return renderPortfolio();
      case 'Case Studies': return renderCaseStudies();
      case 'Recommendations': return renderRecommendations();
      case 'Contact': return renderContact();
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex' }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} />

      {/* Panel */}
      <div style={{ width: '520px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 40px rgba(0,0,0,0.15)', fontFamily: "'Montserrat', sans-serif" }}>
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: `1px solid ${LIGHT_GOLD}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', color: GOLD }}>ADMIN PANEL</p>
            <h2 style={{ margin: '4px 0 0', fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 400 }}>Edit Site</h2>
          </div>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <button onClick={() => signOut(auth)} style={{ padding: '7px 14px', border: `1px solid ${LIGHT_GOLD}`, borderRadius: '999px', background: 'none', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'inherit' }}>Sign Out</button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: '#999' }}>✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${LIGHT_GOLD}`, overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '0.9rem 1.2rem', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', whiteSpace: 'nowrap',
              color: activeTab === tab ? GOLD : '#999',
              borderBottom: activeTab === tab ? `2px solid ${GOLD}` : '2px solid transparent',
              fontFamily: 'inherit',
            }}>{tab.toUpperCase()}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.8rem 2rem' }}>
          {renderTab()}
        </div>

        {/* Footer */}
        <div style={{ padding: '1.2rem 2rem', borderTop: `1px solid ${LIGHT_GOLD}` }}>
          <button onClick={handleSave} disabled={saving} style={{
            width: '100%', padding: '14px', backgroundColor: saved ? '#4caf50' : DARK, color: '#fff',
            border: 'none', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700,
            letterSpacing: '0.12em', cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'background 0.3s', fontFamily: 'inherit',
          }}>
            {saving ? 'SAVING...' : saved ? '✓ SAVED' : 'SAVE CHANGES'}
          </button>
        </div>
      </div>
    </div>
  );
}
