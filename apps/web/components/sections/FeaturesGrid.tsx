'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLocaleStore } from '@/store/localeStore';
import {
  Mic, Pill, AlertTriangle, Bot, Landmark,
  LayoutDashboard, Scan, IndianRupee, Globe,
} from 'lucide-react';

const FEATURES = [
  { title: 'Voice Commands', description: 'Natural language processing in 11 Indian languages with elderly speech pattern recognition.', icon: Mic, color: 'var(--sah-accent-1)' },
  { title: 'Med Scan & Remind', description: 'Photograph a prescription. AI reads it and auto-sets voice reminders.', icon: Pill, color: '#F59E0B' },
  { title: 'SOS Emergency', description: 'Triple-tap, shake, or say "bachao" for instant family alerts with GPS.', icon: AlertTriangle, color: '#F43F5E' },
  { title: 'AI Companion', description: '"Dost" — an empathetic AI friend for daily conversations and loneliness detection.', icon: Bot, color: 'var(--sah-accent-2)' },
  { title: 'Scheme Finder', description: 'Discover eligible government welfare schemes based on profile data.', icon: Landmark, color: '#2D6A4F' },
  { title: 'Family Dashboard', description: 'Real-time caregiver monitoring: meds, location, battery, SOS history.', icon: LayoutDashboard, color: 'var(--sah-accent-1)' },
  { title: 'Emotion Detection', description: 'Camera-based facial analysis detects confusion and auto-simplifies the UI.', icon: Scan, color: '#A855F7' },
  { title: 'Simplified UPI', description: 'Voice-first payment flow: "Ramesh ko 500 rupaye bhejo" — done.', icon: IndianRupee, color: '#F59E0B' },
  { title: 'Multi-Language', description: 'Full UI and voice support across Hindi, Tamil, Bengali, Marathi, and 7 more.', icon: Globe, color: '#2D6A4F' },
];

export function FeaturesGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });
  const { t } = useLocaleStore();

  return (
    <section
      ref={sectionRef}
      id="features"
      style={{
        padding: 'clamp(80px, 10vw, 160px) 24px',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
        animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ textAlign: 'center', marginBottom: 64 }}
      >
        <span className="section-heading" style={{
          display: 'inline-block', padding: '5px 14px', borderRadius: 9999,
          background: 'rgba(var(--sah-accent-1-rgb),0.1)',
          border: '1px solid rgba(var(--sah-accent-1-rgb),0.15)',
          color: 'var(--sah-accent-1)', fontSize: 12, fontWeight: 600,
          marginBottom: 16, fontFamily: 'var(--font-accent)',
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          {t('section.features')}
        </span>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)',
          fontWeight: 900, lineHeight: 1.1, }}>
          {t('features.heading')}
        </h2>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 16,
      }}>
        {FEATURES.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              className="glass-card section-card"
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.06 + 0.2, ease: 'easeOut' }}
              style={{ padding: 28, cursor: 'default' }}
            >
              <div className="icon-container">
                <Icon size={26} strokeWidth={1.5} style={{ color: feature.color }} />
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700,
                marginBottom: 8, color: 'var(--text-primary)',
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
              }}>
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
