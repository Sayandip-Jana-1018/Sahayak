'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Smartphone, Mic, LayoutDashboard } from 'lucide-react';

const STEPS = [
  {
    step: 1,
    title: 'Set Up in 2 Minutes',
    description: 'Install the app on any Android phone. Add your elder\'s profile — name, language, and emergency contacts. That\'s it.',
    icon: Smartphone,
    color: '#FF9933',
  },
  {
    step: 2,
    title: 'They Just Speak',
    description: '"दवाई याद दिला दो," "राहुल को फोन लगाओ," "मदद चाहिए" — Sahayak understands and acts instantly.',
    icon: Mic,
    color: '#A855F7',
  },
  {
    step: 3,
    title: 'You Stay Connected',
    description: 'Monitor medication adherence, location, and wellness from your family dashboard. Get instant SOS alerts.',
    icon: LayoutDashboard,
    color: '#22C55E',
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
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
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.15)',
          color: '#22C55E', fontSize: 12, fontWeight: 600,
          marginBottom: 16, fontFamily: 'var(--font-accent)',
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          How It Works
        </span>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)',
          fontWeight: 900, lineHeight: 1.1, fontStyle: 'italic',
        }}>
          Simple as <span style={{ color: 'var(--sah-accent-1)' }}>1-2-3</span>
        </h2>
      </motion.div>

      {/* Asymmetric layout: Step 1 left big, Steps 2+3 right stacked */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: 'auto auto',
        gap: 20,
        position: 'relative',
      }}>
        {/* Step 1 — Large left card spanning 2 rows */}
        <motion.div
          className="glass-card section-card"
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            gridRow: '1 / 3',
            padding: 40,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* Large background number */}
          <div style={{
            position: 'absolute', top: 20, right: 24,
            fontSize: 180, fontWeight: 900, fontFamily: 'var(--font-display)',
            color: 'var(--text-primary)', opacity: 0.03,
            lineHeight: 1, pointerEvents: 'none',
          }}>
            01
          </div>

          <div className="icon-container">
            <Smartphone size={26} strokeWidth={1.5} style={{ color: STEPS[0].color }} />
          </div>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900,
            marginBottom: 12, color: STEPS[0].color, fontStyle: 'italic',
          }}>
            {STEPS[0].title}
          </h3>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', maxWidth: 380 }}>
            {STEPS[0].description}
          </p>
        </motion.div>

        {/* Step 2 — Right top */}
        <motion.div
          className="glass-card section-card"
          initial={{ opacity: 0, x: 40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.45 }}
          style={{ padding: 32, position: 'relative' }}
        >
          <div style={{
            position: 'absolute', top: 12, right: 16,
            fontSize: 80, fontWeight: 900, fontFamily: 'var(--font-display)',
            color: 'var(--text-primary)', opacity: 0.03, lineHeight: 1, pointerEvents: 'none',
          }}>
            02
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div className="icon-container" style={{ marginBottom: 0 }}>
              <Mic size={22} strokeWidth={1.5} style={{ color: STEPS[1].color }} />
            </div>
            <div>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
                marginBottom: 8, color: STEPS[1].color,
              }}>
                {STEPS[1].title}
              </h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                {STEPS[1].description}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Step 3 — Right bottom */}
        <motion.div
          className="glass-card section-card"
          initial={{ opacity: 0, x: 40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{ padding: 32, position: 'relative' }}
        >
          <div style={{
            position: 'absolute', top: 12, right: 16,
            fontSize: 80, fontWeight: 900, fontFamily: 'var(--font-display)',
            color: 'var(--text-primary)', opacity: 0.03, lineHeight: 1, pointerEvents: 'none',
          }}>
            03
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div className="icon-container" style={{ marginBottom: 0 }}>
              <LayoutDashboard size={22} strokeWidth={1.5} style={{ color: STEPS[2].color }} />
            </div>
            <div>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
                marginBottom: 8, color: STEPS[2].color,
              }}>
                {STEPS[2].title}
              </h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                {STEPS[2].description}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Connecting line SVG */}
        <svg
          style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 60, height: '80%', pointerEvents: 'none', opacity: 0.15,
          }}
        >
          <line x1="30" y1="0" x2="30" y2="100%" stroke="var(--sah-accent-1)" strokeWidth="1" strokeDasharray="4 6" />
        </svg>
      </div>
    </section>
  );
}
