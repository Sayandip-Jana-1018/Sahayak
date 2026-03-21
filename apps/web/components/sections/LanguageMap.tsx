'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLocaleStore, type Locale } from '@/store/localeStore';

const LANGUAGES = [
  { code: 'hi',  name: 'Hindi',     native: 'हिंदी',     speakers: '57Cr', regions: ['UP', 'MP', 'Bihar', 'Rajasthan', 'Jharkhand', 'Delhi'] },
  { code: 'ta',  name: 'Tamil',     native: 'தமிழ்',      speakers: '7.5Cr', regions: ['Tamil Nadu', 'Puducherry'] },
  { code: 'bn',  name: 'Bengali',   native: 'বাংলা',      speakers: '10Cr', regions: ['West Bengal', 'Tripura'] },
  { code: 'mr',  name: 'Marathi',   native: 'मराठी',     speakers: '8.3Cr', regions: ['Maharashtra', 'Goa'] },
  { code: 'te',  name: 'Telugu',    native: 'తెలుగు',     speakers: '8.2Cr', regions: ['Telangana', 'Andhra Pradesh'] },
  { code: 'kn',  name: 'Kannada',   native: 'ಕನ್ನಡ',      speakers: '4.5Cr', regions: ['Karnataka'] },
  { code: 'gu',  name: 'Gujarati',  native: 'ગુજરાતી',    speakers: '5.5Cr', regions: ['Gujarat'] },
  { code: 'pa',  name: 'Punjabi',   native: 'ਪੰਜਾਬੀ',    speakers: '3.3Cr', regions: ['Punjab', 'Haryana'] },
  { code: 'ml',  name: 'Malayalam', native: 'മലയാളം',   speakers: '3.5Cr', regions: ['Kerala'] },
  { code: 'ur',  name: 'Urdu',      native: 'اردو',       speakers: '5.1Cr', regions: ['J&K', 'Telangana'] },
  { code: 'en',  name: 'English',   native: 'English',   speakers: '13Cr', regions: ['Pan-India'] },
];

export function LanguageMap() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null);
  const { setLocale } = useLocaleStore();

  const activeData = LANGUAGES.find(l => l.code === activeLanguage);

  return (
    <section ref={sectionRef} id="languages" style={{ padding: 'clamp(80px, 10vw, 160px) 24px', maxWidth: 1200, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 64 }}>
        <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 9999, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
          Languages
        </span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, lineHeight: 1.2 }}>
          11 Languages. <span style={{ color: 'var(--sah-accent-1)' }}>One Voice.</span>
        </h2>
        <p style={{ fontSize: 16, opacity: 0.6, marginTop: 12, maxWidth: 500, margin: '12px auto 0' }}>
          Sahayak speaks the language your elders grew up with.
        </p>
      </motion.div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 40 }}>
        {LANGUAGES.map((lang, i) => (
          <motion.button
            key={lang.code}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.3, delay: i * 0.04 + 0.3 }}
            onClick={() => {
              const newCode = activeLanguage === lang.code ? null : lang.code;
              setActiveLanguage(newCode);
              if (newCode) setLocale(newCode as Locale);
            }}
            style={{
              padding: '10px 20px', borderRadius: 9999, border: 'none',
              background: activeLanguage === lang.code ? 'var(--sah-accent-1)' : 'rgba(255,255,255,0.04)',
              color: activeLanguage === lang.code ? '#000' : undefined,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              outline: activeLanguage === lang.code ? 'none' : '1px solid rgba(255,255,255,0.08)',
              transition: 'all 0.2s',
            }}
          >
            {lang.native}
          </motion.button>
        ))}
      </div>

      {activeData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            maxWidth: 500, margin: '0 auto', padding: 28, borderRadius: 20,
            background: 'rgba(255,158,44,0.05)', border: '1px solid rgba(255,158,44,0.15)', textAlign: 'center',
          }}
        >
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            {activeData.native} ({activeData.name})
          </h3>
          <p style={{ fontSize: 14, opacity: 0.6, marginBottom: 8 }}>{activeData.speakers} native speakers</p>
          <p style={{ fontSize: 13, opacity: 0.5 }}>Regions: {activeData.regions.join(', ')}</p>
        </motion.div>
      )}
    </section>
  );
}
