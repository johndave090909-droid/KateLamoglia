export const defaultContent = {
  hero: {
    firstName: 'Katriel',
    lastName: 'Lamoglia',
    subtitle: 'CLASS OF 2026',
    description: 'A passionate marketing and brand strategy student dedicated to creating meaningful connections between luxury brands and modern consumers.',
    achievement: "Dean's List 2024–2025",
    experienceLabel: 'Marketing Intern @ Vogue',
    imageUrl: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=680&q=80',
  },
  about: {
    bio1: "I'm Katriel Lamoglia, a marketing and brand strategy student at the top of my class. My passion lies at the intersection of luxury aesthetics and consumer psychology — understanding what moves people and translating that into compelling brand narratives.",
    bio2: 'From editorial shoots to campaign strategy, I bring a meticulous eye for detail and a deep appreciation for the stories behind the brands I work with.',
    major: 'Marketing & Brand Strategy',
    university: 'De La Salle University',
    graduation: 'Class of 2026',
    location: 'Manila, Philippines',
    yearsExp: '3+',
    imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&q=80',
  },
  resume: {
    education: [
      { year: '2022 – 2026', title: 'BS Marketing Management', place: 'De La Salle University', desc: "Dean's List 2024–2025. Focus on brand strategy and consumer behavior." },
      { year: '2018 – 2022', title: 'Senior High School — STEM', place: 'Ateneo de Manila', desc: 'Graduated with honors. Active in student publications.' },
    ],
    experience: [
      { year: 'Summer 2025', title: 'Marketing Intern', place: 'Vogue Philippines', desc: 'Assisted in digital campaign strategy, social media content planning, and editorial brand partnerships.' },
      { year: 'Jan – May 2024', title: 'Brand Strategy Intern', place: 'Ayala Malls Group', desc: 'Conducted consumer research and contributed to quarterly brand positioning reports.' },
      { year: '2023 – Present', title: 'Marketing Committee Head', place: 'DLSU Marketing Society', desc: 'Led a team of 12 in executing on-campus brand activation events.' },
    ],
    skills: ['Brand Strategy', 'Content Marketing', 'Social Media', 'Consumer Research', 'Campaign Planning', 'Copywriting', 'Adobe Creative Suite', 'Canva', 'Google Analytics', 'Event Marketing', 'PR & Media Relations', 'Luxury Brand Management'],
  },
  portfolio: {
    items: [
      { title: 'Vogue PH Digital Campaign', tag: 'Social Media', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80' },
      { title: 'Luxury Brand Activation', tag: 'Event Marketing', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&q=80' },
      { title: 'Consumer Insights Report', tag: 'Research', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80' },
      { title: 'DLSU MktgSoc Launch', tag: 'Brand Identity', img: 'https://images.unsplash.com/photo-1529245856630-f4853233d2ea?w=500&q=80' },
      { title: 'Ayala Malls Campaign', tag: 'Campaign Planning', img: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=500&q=80' },
      { title: 'Editorial Lookbook', tag: 'Content Creation', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80' },
    ],
  },
  recommendations: {
    items: [
      { name: 'Maria Santos', role: 'Editor-in-Chief, Vogue PH', quote: "Katriel's instinct for brand storytelling is rare for someone her age. She brought fresh perspective and executional excellence to every brief we gave her." },
      { name: 'Prof. Ana Reyes', role: 'Marketing Chair, DLSU', quote: "One of the most driven students I've mentored. Her thesis on luxury brand positioning was among the best I've read in a decade of teaching." },
      { name: 'Carlo Mendez', role: 'Brand Director, Ayala Malls', quote: "She consistently delivers thoughtful, data-backed recommendations. Her consumer research internship output exceeded expectations for a student her level." },
    ],
  },
  contact: {
    email: 'katriel@email.com',
    phone: '+63 912 345 6789',
    location: 'Manila, Philippines',
  },
};

export type SiteContent = typeof defaultContent;
