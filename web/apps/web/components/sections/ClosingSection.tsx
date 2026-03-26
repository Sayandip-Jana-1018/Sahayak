'use client';

import { motion, useInView } from 'framer-motion';
import { ArrowRight, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';
import { useRef } from 'react';

const PILLARS = [
  {
    icon: HeartHandshake,
    title: 'Built for dignity',
    body: 'Every interaction is designed for clarity, calm, and confidence on a real low-cost Android phone.',
  },
  {
    icon: ShieldCheck,
    title: 'Safety before speed',
    body: 'Emergency help, medication history, and irreversible actions are treated with explicit trust-first safeguards.',
  },
  {
    icon: Sparkles,
    title: 'Beautiful by default',
    body: 'Voice, motion, typography, and glass surfaces come together so the product feels humane, not clinical.',
  },
];

export function ClosingSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      ref={ref}
      style={{
        position: 'relative',
        padding: 'clamp(88px, 11vw, 160px) 24px clamp(64px, 8vw, 112px)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '8% 5% 0',
          borderRadius: 40,
          background:
            'radial-gradient(circle at 18% 20%, rgba(var(--sah-accent-1-rgb), 0.22), transparent 34%), radial-gradient(circle at 82% 12%, rgba(var(--sah-accent-2-rgb), 0.18), transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
          filter: 'blur(10px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            borderRadius: 36,
            padding: 'clamp(28px, 4vw, 40px)',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow:
              '0 24px 80px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.12)',
            backdropFilter: 'blur(28px) saturate(160%)',
            WebkitBackdropFilter: 'blur(28px) saturate(160%)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 'clamp(28px, 4vw, 56px)',
              alignItems: 'start',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 999,
                  background: 'rgba(var(--sah-accent-1-rgb), 0.12)',
                  border: '1px solid rgba(var(--sah-accent-1-rgb), 0.22)',
                  color: 'var(--sah-accent-1)',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: 20,
                }}
              >
                Final call to action
              </div>

              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(34px, 5vw, 68px)',
                  lineHeight: 1.02,
                  letterSpacing: '-0.04em',
                  maxWidth: 760,
                  marginBottom: 18,
                }}
              >
                Build a phone experience that feels safe, beautiful, and deeply human.
              </h2>

              <p
                style={{
                  fontSize: 'clamp(16px, 1.3vw, 20px)',
                  lineHeight: 1.75,
                  color: 'var(--text-secondary)',
                  maxWidth: 640,
                  marginBottom: 32,
                }}
              >
                Sahayak is not another app wrapper. It is a voice-first operating layer for
                people who deserve more clarity, more independence, and less digital friction.
              </p>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 14,
                  marginBottom: 28,
                }}
              >
                <a
                  href="/login"
                  className="sah-btn"
                  style={{
                    background: 'linear-gradient(135deg, var(--sah-accent-1), #ffb45b)',
                    color: '#1b1104',
                    boxShadow: '0 14px 36px rgba(var(--sah-accent-1-rgb), 0.28)',
                  }}
                >
                  Start the experience
                  <ArrowRight size={18} />
                </a>
                <a
                  href="#voice-demo"
                  className="sah-btn sah-btn--ghost"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderColor: 'rgba(255,255,255,0.14)',
                  }}
                >
                  Hear the voice demo
                </a>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 16,
                }}
              >
                {PILLARS.map((pillar, index) => {
                  const Icon = pillar.icon;
                  return (
                    <motion.div
                      key={pillar.title}
                      initial={{ opacity: 0, y: 18 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.18 + index * 0.08 }}
                      style={{
                        padding: '18px 18px 20px',
                        borderRadius: 22,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 16,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(var(--sah-accent-1-rgb), 0.14)',
                          color: 'var(--sah-accent-1)',
                          marginBottom: 14,
                        }}
                      >
                        <Icon size={18} />
                      </div>
                      <h3
                        style={{
                          fontSize: 18,
                          fontFamily: 'var(--font-display)',
                          lineHeight: 1.15,
                          marginBottom: 10,
                        }}
                      >
                        {pillar.title}
                      </h3>
                      <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                        {pillar.body}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 22 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.12 }}
              style={{
                alignSelf: 'stretch',
                borderRadius: 28,
                padding: '24px 24px 28px',
                background:
                  'linear-gradient(180deg, rgba(10,10,20,0.48), rgba(10,10,20,0.26))',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                minHeight: 420,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 20,
                  }}
                >
                  <span
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: 12,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Live product direction
                  </span>
                  <span
                    style={{
                      color: '#66d48d',
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    Elderly-first
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gap: 14,
                  }}
                >
                  {[
                    ['Voice roundtrip', 'Whisper to Gemini to spoken reply'],
                    ['Emergency confidence', 'Real SOS events, resolve flow, and SMS fallback'],
                    ['Care visibility', 'Shared backend and database for app and web'],
                    ['Mobile quality', 'Glass UI, dark and light themes, multilingual foundation'],
                  ].map(([title, body]) => (
                    <div
                      key={title}
                      style={{
                        paddingBottom: 14,
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <div
                        style={{
                          color: 'var(--text-primary)',
                          fontWeight: 700,
                          fontSize: 15,
                          marginBottom: 4,
                        }}
                      >
                        {title}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                        {body}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 22,
                  padding: '18px 18px 20px',
                  background:
                    'linear-gradient(135deg, rgba(var(--sah-accent-1-rgb),0.16), rgba(var(--sah-accent-2-rgb),0.12))',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    marginBottom: 8,
                  }}
                >
                  Promise
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(22px, 2.2vw, 30px)',
                    lineHeight: 1.08,
                    marginBottom: 8,
                  }}
                >
                  It works when the internet does not, and it never leaves the user confused.
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
                  That is the standard the app and the web platform are being built to meet.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
