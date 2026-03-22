// @ts-nocheck
'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';

const CAPTIONS = [
  { start: 0, end: 0.18, title: 'Voice-First UPI', sub: '"प्रिया को ₹400 भेजो"', desc: 'No typing. No menus. Just speak naturally in your language — transaction done in 4 seconds.' },
  { start: 0.25, end: 0.45, title: 'Smart Medication', sub: 'Never miss a dose', desc: 'Scan any prescription. AI reads it and sets voice reminders in their language automatically.' },
  { start: 0.50, end: 0.70, title: 'SOS Emergency', sub: 'Help in 3 seconds', desc: 'Triple-tap, shake, or say "bachao." Instant GPS-tagged alerts reach every family member.' },
  { start: 0.75, end: 0.95, title: 'Always Connected', sub: 'Family dashboard', desc: 'Every payment, medication, and SOS — visible on your always-on caregiver dashboard.' },
];

/* ── StoryScroll — Captions only, 3D phone is rendered by PhoneScene overlay ── */
export function StoryScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentCaption, setCurrentCaption] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const captionOpacity = useTransform(scrollYProgress, [0, 0.05, 0.9, 1], [0, 1, 1, 0]);

  useMotionValueEvent(scrollYProgress, 'change', (val) => {
    for (let i = CAPTIONS.length - 1; i >= 0; i--) {
      if (val >= CAPTIONS[i].start) { setCurrentCaption(i); break; }
    }
  });

  return (
    <div ref={containerRef} id="story-scroll" style={{ height: '350vh', position: 'relative' }}>
      <div style={{
        position: 'sticky', top: 0, height: '100vh',
        display: 'flex', alignItems: 'center',
        overflow: 'hidden',
        padding: '0 clamp(24px, 5vw, 80px)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 40, width: '100%', maxWidth: 1200,
          margin: '0 auto', alignItems: 'center',
        }}>
          {/* Left: Captions */}
          <motion.div style={{ position: 'relative', minHeight: 260, opacity: captionOpacity }}>
            {CAPTIONS.map((cap, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  opacity: currentCaption === i ? 1 : 0,
                  y: currentCaption === i ? 0 : 40,
                  filter: currentCaption === i ? 'blur(0px)' : 'blur(6px)',
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                  position: i === 0 ? 'relative' : 'absolute',
                  top: 0, left: 0, right: 0,
                  pointerEvents: currentCaption === i ? 'auto' : 'none',
                }}
              >
                <span style={{
                  display: 'inline-block', padding: '4px 12px', borderRadius: 9999,
                  background: 'rgba(var(--sah-accent-1-rgb), 0.1)',
                  border: '1px solid rgba(var(--sah-accent-1-rgb), 0.2)',
                  color: 'var(--sah-accent-1)', fontSize: 11, fontWeight: 600,
                  fontFamily: 'var(--font-accent)', letterSpacing: '0.08em',
                  textTransform: 'uppercase', marginBottom: 16,
                }}>
                  {cap.title}
                </span>
                <h2 style={{
                  fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.5vw, 48px)',
                  fontWeight: 800, lineHeight: 1.1, color: 'var(--text-primary)', marginTop: 12,
                }}>
                  {cap.sub}
                </h2>
                <p style={{
                  fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)',
                  marginTop: 16, fontFamily: 'var(--font-body)', maxWidth: 380,
                }}>
                  {cap.desc}
                </p>

                {/* Progress dots */}
                <div style={{ display: 'flex', gap: 6, marginTop: 28 }}>
                  {CAPTIONS.map((_, j) => (
                    <div key={j} style={{
                      width: currentCaption === j ? 32 : 8, height: 4, borderRadius: 4,
                      background: currentCaption === j ? 'var(--sah-accent-1)' : 'rgba(255,255,255,0.12)',
                      transition: 'all 0.35s ease',
                    }} />
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right: Placeholder for phone — the actual 3D model is overlaid by PhoneScene */}
          <div style={{ height: 'min(70vh, 600px)', position: 'relative' }} />
        </div>
      </div>
    </div>
  );
}
