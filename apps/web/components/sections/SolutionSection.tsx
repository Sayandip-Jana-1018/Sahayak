'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLocaleStore } from '@/store/localeStore';
import { Mic, Pill, AlertTriangle, Bot, Landmark, LayoutDashboard } from 'lucide-react';

const FEATURES = [
  {
    title: 'Voice Commands',
    description: 'Just speak naturally in any of 11 Indian languages. Sahayak understands local dialects, elderly speech patterns, and even noisy environments.',
    icon: Mic, color: '#FF9933',
  },
  {
    title: 'Medication Reminders',
    description: 'Scan prescriptions with your phone camera. Sahayak auto-sets reminders in their language with gentle voice alerts.',
    icon: Pill, color: '#F59E0B',
  },
  {
    title: 'SOS Emergency',
    description: 'Triple-tap, shake, or just say "bachao." Instant alerts to family with live GPS location and nearest hospital info.',
    icon: AlertTriangle, color: '#F43F5E',
  },
  {
    title: 'AI Companion',
    description: '"Dost" — an empathetic AI friend that chats, tells stories, recites poetry, and detects loneliness to alert caregivers.',
    icon: Bot, color: '#22C55E',
  },
  {
    title: 'Scheme Finder',
    description: 'Discovers eligible government welfare schemes based on age, state, and income. Explains benefits in simple Hindi.',
    icon: Landmark, color: '#2D6A4F',
  },
  {
    title: 'Family Dashboard',
    description: 'Real-time monitoring for caregivers: medication adherence, location, battery level, SOS history — all in one place.',
    icon: LayoutDashboard, color: '#A855F7',
  },
];

export function SolutionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const { t } = useLocaleStore();

  return (
    <section
      ref={sectionRef}
      id="solution"
      style={{
        padding: 'clamp(80px, 10vw, 160px) 24px',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
        animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
        transition={{ duration: 0.8 }}
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
          {t('section.solution')}
        </span>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)',
          fontWeight: 900, lineHeight: 1.1, maxWidth: 600, margin: '0 auto',
          }}>
          {t('solution.heading')}
        </h2>
        <p style={{
          fontSize: 17, color: 'var(--text-secondary)', marginTop: 16,
          maxWidth: 500, margin: '16px auto 0', fontFamily: 'var(--font-body)',
        }}>
          {t('solution.sub')}
        </p>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 20,
      }}>
        {FEATURES.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              className="glass-card section-card"
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 + 0.2 }}
              style={{ padding: 32, cursor: 'default' }}
            >
              <div className="icon-container">
                <Icon size={26} strokeWidth={1.5} style={{ color: feature.color }} />
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700,
                marginBottom: 8, color: 'var(--text-primary)',
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)',
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
