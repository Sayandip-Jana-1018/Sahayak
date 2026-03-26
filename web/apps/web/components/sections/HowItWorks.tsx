'use client';

import { motion, useInView } from 'framer-motion';
import { ChevronRight, LayoutDashboard, Mic, Smartphone } from 'lucide-react';
import { useRef } from 'react';
import { useLocaleStore } from '@/store/localeStore';

const STEPS = [
  {
    num: '01',
    titleKey: 'how.step1.title',
    descKey: 'how.step1.desc',
    Icon: Smartphone,
    accent: '#FF9A4D',
    glow: 'rgba(255,154,77,0.24)',
  },
  {
    num: '02',
    titleKey: 'how.step2.title',
    descKey: 'how.step2.desc',
    Icon: Mic,
    accent: '#FFCC57',
    glow: 'rgba(255,204,87,0.22)',
  },
  {
    num: '03',
    titleKey: 'how.step3.title',
    descKey: 'how.step3.desc',
    Icon: LayoutDashboard,
    accent: '#9DD5FF',
    glow: 'rgba(157,213,255,0.22)',
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const t = useLocaleStore((s) => s.t);

  return (
    <section
      ref={ref}
      id="how-it-works"
      style={{
        position: 'relative',
        padding: 'clamp(88px, 10vw, 150px) 24px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '10% 8% auto',
          height: '72%',
          borderRadius: 40,
          background:
            'radial-gradient(circle at 15% 20%, rgba(var(--sah-accent-1-rgb), 0.16), transparent 28%), radial-gradient(circle at 82% 18%, rgba(var(--sah-accent-2-rgb), 0.14), transparent 26%), radial-gradient(circle at 50% 75%, rgba(255,255,255,0.05), transparent 30%)',
          filter: 'blur(14px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 1220, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', marginBottom: 50 }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 999,
              background: 'rgba(var(--sah-accent-1-rgb), 0.1)',
              border: '1px solid rgba(var(--sah-accent-1-rgb), 0.2)',
              color: 'var(--sah-accent-1)',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginBottom: 18,
            }}
          >
            How it works
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(34px, 5vw, 64px)',
              lineHeight: 1.02,
              letterSpacing: '-0.04em',
              marginBottom: 14,
            }}
          >
            Three calm steps.
            <br />
            One voice-first experience.
          </h2>

          <p
            style={{
              maxWidth: 720,
              margin: '0 auto',
              fontSize: 'clamp(16px, 1.25vw, 19px)',
              lineHeight: 1.75,
              color: 'var(--text-secondary)',
            }}
          >
            The product is designed so an elder never has to wonder what comes next. Setup is short,
            speaking is natural, and family visibility stays in sync through the shared backend.
          </p>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
            alignItems: 'stretch',
          }}
        >
          {STEPS.map((step, index) => {
            const Icon = step.Icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.65, delay: 0.14 + index * 0.12 }}
                style={{
                  position: 'relative',
                  minHeight: 330,
                  borderRadius: 30,
                  padding: '26px 24px 24px',
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.035))',
                  border: '1px solid rgba(255,255,255,0.11)',
                  boxShadow:
                    '0 24px 60px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(24px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(150%)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 'auto auto -30px -10px',
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    background: step.glow,
                    filter: 'blur(24px)',
                    pointerEvents: 'none',
                  }}
                />

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: 26,
                  }}
                >
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 18,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `${step.glow}`,
                      border: `1px solid ${step.glow.replace('0.22', '0.45').replace('0.24', '0.45')}`,
                      color: step.accent,
                    }}
                  >
                    <Icon size={24} />
                  </div>

                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 76,
                      fontWeight: 800,
                      lineHeight: 0.9,
                      letterSpacing: '-0.08em',
                      color: 'rgba(255,255,255,0.08)',
                    }}
                  >
                    {step.num}
                  </div>
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: step.accent,
                    marginBottom: 14,
                  }}
                >
                  Step {step.num}
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(24px, 2vw, 30px)',
                    lineHeight: 1.08,
                    marginBottom: 12,
                    color: 'var(--text-primary)',
                  }}
                >
                  {t(step.titleKey)}
                </h3>

                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.8,
                    color: 'var(--text-secondary)',
                    maxWidth: 340,
                  }}
                >
                  {t(step.descKey)}
                </p>

                {index < STEPS.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      right: -12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 44,
                      height: 44,
                      borderRadius: 999,
                      display: 'none',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.55)',
                    }}
                    className="hiw-desktop-arrow"
                  >
                    <ChevronRight size={18} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          style={{
            marginTop: 28,
            borderRadius: 26,
            padding: '18px 22px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 14,
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {[
            ['11 languages', 'Hindi-first today, multilingual by design'],
            ['Works with family visibility', 'Shared backend and synced device state'],
            ['Designed for trust', 'Large touch targets, spoken responses, explicit confirmations'],
          ].map(([title, body]) => (
            <div key={title}>
              <div
                style={{
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: 14,
                  marginBottom: 4,
                }}
              >
                {title}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7 }}>
                {body}
              </div>
            </div>
          ))}
        </motion.div>

        <style jsx>{`
          .hiw-desktop-arrow {
            display: none;
          }

          @media (min-width: 1100px) {
            .hiw-desktop-arrow {
              display: inline-flex;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
