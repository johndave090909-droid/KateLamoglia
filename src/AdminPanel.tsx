import React, { useState, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from './firebase';
import { SiteContent } from './defaultContent';

const GOLD = '#c9a96e';
const DARK = '#1c1c1c';
const CREAM = '#f5f0e8';
const LIGHT_GOLD = '#e8d9be';

const tabs = ['Hero', 'About', 'Resume', 'Portfolio', 'Recommendations', 'Contact'];

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
      {/* Education */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em' }}>EDUCATION</h4>
          <button onClick={() => update('resume', 'education', [...draft.resume.education, { year: '', title: '', place: '', desc: '' }])}
            style={{ padding: '6px 14px', backgroundColor: GOLD, color: '#fff', border: 'none', borderRadius: '999px', fontSize: '0.72rem', cursor: 'pointer' }}>+ Add</button>
        </div>
        {draft.resume.education.map((item, i) => (
          <div key={i} style={{ backgroundColor: CREAM, borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem', position: 'relative' }}>
            <button onClick={() => update('resume', 'education', draft.resume.education.filter((_, j) => j !== i))}
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '1rem' }}>✕</button>
            {['year', 'title', 'place', 'desc'].map(field => (
              <div key={field} style={{ marginBottom: '0.6rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888' }}>{field.toUpperCase()}</label>
                <input value={(item as any)[field]} onChange={e => {
                  const updated = [...draft.resume.education];
                  (updated[i] as any)[field] = e.target.value;
                  update('resume', 'education', updated);
                }} style={{ display: 'block', width: '100%', padding: '7px 12px', border: `1px solid ${LIGHT_GOLD}`, borderRadius: '6px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', marginTop: '4px' }} />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Experience */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em' }}>EXPERIENCE</h4>
          <button onClick={() => update('resume', 'experience', [...draft.resume.experience, { year: '', title: '', place: '', desc: '' }])}
            style={{ padding: '6px 14px', backgroundColor: GOLD, color: '#fff', border: 'none', borderRadius: '999px', fontSize: '0.72rem', cursor: 'pointer' }}>+ Add</button>
        </div>
        {draft.resume.experience.map((item, i) => (
          <div key={i} style={{ backgroundColor: CREAM, borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem', position: 'relative' }}>
            <button onClick={() => update('resume', 'experience', draft.resume.experience.filter((_, j) => j !== i))}
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '1rem' }}>✕</button>
            {['year', 'title', 'place', 'desc'].map(field => (
              <div key={field} style={{ marginBottom: '0.6rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888' }}>{field.toUpperCase()}</label>
                <input value={(item as any)[field]} onChange={e => {
                  const updated = [...draft.resume.experience];
                  (updated[i] as any)[field] = e.target.value;
                  update('resume', 'experience', updated);
                }} style={{ display: 'block', width: '100%', padding: '7px 12px', border: `1px solid ${LIGHT_GOLD}`, borderRadius: '6px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', marginTop: '4px' }} />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Skills */}
      <div>
        <h4 style={{ margin: '0 0 1rem', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em' }}>SKILLS</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          {draft.resume.skills.map((skill, i) => (
            <span key={i} style={{ padding: '6px 14px', backgroundColor: LIGHT_GOLD, borderRadius: '999px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {skill}
              <button onClick={() => update('resume', 'skills', draft.resume.skills.filter((_, j) => j !== i))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0, fontSize: '0.8rem' }}>✕</button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input id="newSkill" placeholder="Add a skill..." style={{ flex: 1, padding: '8px 14px', border: `1px solid ${LIGHT_GOLD}`, borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const val = (e.target as HTMLInputElement).value.trim();
                if (val) { update('resume', 'skills', [...draft.resume.skills, val]); (e.target as HTMLInputElement).value = ''; }
              }
            }} />
          <button onClick={() => {
            const el = document.getElementById('newSkill') as HTMLInputElement;
            if (el?.value.trim()) { update('resume', 'skills', [...draft.resume.skills, el.value.trim()]); el.value = ''; }
          }} style={{ padding: '8px 16px', backgroundColor: GOLD, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer' }}>Add</button>
        </div>
      </div>
    </div>
  );

  const renderPortfolio = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em' }}>PORTFOLIO ITEMS</h4>
        <button onClick={() => update('portfolio', 'items', [...draft.portfolio.items, { title: '', tag: '', img: '' }])}
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
        <button onClick={() => update('recommendations', 'items', [...draft.recommendations.items, { name: '', role: '', quote: '' }])}
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
        </div>
      ))}
    </div>
  );

  const renderContact = () => (
    <div>
      {input('Email', draft.contact.email, v => update('contact', 'email', v))}
      {input('Phone', draft.contact.phone, v => update('contact', 'phone', v))}
      {input('Location', draft.contact.location, v => update('contact', 'location', v))}
    </div>
  );

  const renderTab = () => {
    switch (activeTab) {
      case 'Hero': return renderHero();
      case 'About': return renderAbout();
      case 'Resume': return renderResume();
      case 'Portfolio': return renderPortfolio();
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
