import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { defaultContent, SiteContent } from './defaultContent';

export function useContent() {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'site', 'content'), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Partial<SiteContent>;
        setContent({
          ...defaultContent,
          ...data,
          resume: {
            ...defaultContent.resume,
            personalBrand: (data.resume as any)?.personalBrand ?? defaultContent.resume.personalBrand,
            leadershipStrengths: (data.resume as any)?.leadershipStrengths ?? defaultContent.resume.leadershipStrengths,
            accomplishments: (data.resume as any)?.accomplishments ?? defaultContent.resume.accomplishments,
            // Only use Firestore experience if it has the new format (has bullets array)
            experience: (data.resume as any)?.experience?.[0]?.bullets
              ? (data.resume as any).experience
              : defaultContent.resume.experience,
            credentials: {
              ...defaultContent.resume.credentials,
              ...((data.resume as any)?.credentials ?? {}),
            },
            skills: (data.resume as any)?.skills ?? defaultContent.resume.skills,
          },
          hero: { ...defaultContent.hero, ...(data.hero ?? {}) },
          about: { ...defaultContent.about, ...(data.about ?? {}) },
          portfolio: { ...defaultContent.portfolio, ...(data.portfolio ?? {}), items: (data.portfolio as any)?.items ?? defaultContent.portfolio.items },
          recommendations: { ...defaultContent.recommendations, ...(data.recommendations ?? {}) },
          caseStudiesDescription: (data as any)?.caseStudiesDescription ?? defaultContent.caseStudiesDescription,
          caseStudies: (data as any)?.caseStudies ?? defaultContent.caseStudies,
          music: { url: (data as any)?.music?.url || defaultContent.music.url },
          contact: {
            ...defaultContent.contact,
            ...(data.contact ?? {}),
            socials: (data.contact as any)?.socials ?? defaultContent.contact.socials,
          },
        });
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const saveContent = async (updated: SiteContent) => {
    await setDoc(doc(db, 'site', 'content'), updated);
  };

  return { content, loading, saveContent };
}
