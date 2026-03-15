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
        setContent({ ...defaultContent, ...snap.data() as SiteContent });
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
