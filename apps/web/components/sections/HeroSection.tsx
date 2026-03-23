'use client';

import { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLocaleStore } from '@/store/localeStore';
import { Lock, Wifi, Globe, Heart, ArrowDown } from 'lucide-react';

/* ── Staggered word animation ── */
function StaggeredLine({ text, delay = 0, gradient = false }: {
  text: string; delay?: number; gradient?: boolean;
}) {
  const words = text.split(' ');
  return (
    <span style={{ display: 'inline' }}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.55, delay: delay + i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            display: 'inline-block', marginRight: '0.18em',
            ...(gradient ? {
              background: 'linear-gradient(90deg, #FF6B2C 0%, #FF9A5C 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              paddingBottom: '0.12em',
              lineHeight: '1.2',
            } : {}),
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

/* ── Trust Row Items ── */
const TRUST_ITEMS = [
  { icon: Lock,  label: 'On-device AI',  color: '#A855F7' },
  { icon: Wifi,  label: 'Works on 2G',   color: '#22C55E' },
  { icon: Globe, label: '11 Languages',  color: '#3B82F6' },
  { icon: Heart, label: 'Free forever',  color: '#F43F5E' },
];

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.12 });
  const { t } = useLocaleStore();

  /* ── Parallax: text moves UP as you scroll, sliding behind the laptop ── */
  useEffect(() => {
    const tick = () => {
      if (!textRef.current || !sectionRef.current) {
        requestAnimationFrame(tick);
        return;
      }
      const rect = sectionRef.current.getBoundingClientRect();
      const scrolled = Math.max(0, -rect.top);
      const heroH = sectionRef.current.offsetHeight;
      const translateY = -(scrolled * 0.3);
      const opacity = Math.max(0, 1 - (scrolled / heroH) * 2.5);
      textRef.current.style.transform = `translateY(${translateY}px)`;
      textRef.current.style.opacity = String(opacity);
      requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflow: 'hidden',
        padding: 'clamp(80px, 12vh, 120px) clamp(16px, 4vw, 48px) 0',
      }}
    >
      {/* ─── Theme-aware vignette behind text ─── */}
      <div className="hero-vignette" style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '75%',
        pointerEvents: 'none',
        zIndex: 2,
      }} />

      {/* ─── All hero content (parallax wrapper) ─── */}
      <div
        ref={textRef}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', width: '100%', zIndex: 5,
          willChange: 'transform, opacity',
        }}
      >
        {/* Badge — FIX 2: 24px gap below */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderRadius: 9999,
            background: 'rgba(var(--sah-accent-1-rgb), 0.08)',
            border: '1px solid rgba(var(--sah-accent-1-rgb), 0.18)',
            backdropFilter: 'blur(12px)',
            fontSize: 'clamp(9px, 0.75vw, 11px)',
            fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase' as const,
            color: 'var(--sah-accent-1)',
            fontFamily: 'var(--font-accent)',
            marginBottom: 24,
          }}
        >
          {t('hero.badge')}
        </motion.div>

        {/* H1 — centered, max-width 800px, FIX 2: 48px gap below */}
        {isInView && (
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 5vw, 72px)',
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            margin: '0 auto 48px',
            maxWidth: 800,
            textShadow: '0 2px 24px rgba(0,0,0,0.4)',
          }}>
            <StaggeredLine text={t('hero.line1')} delay={0.15} />
            <br />
            <StaggeredLine text={t('hero.line2')} delay={0.35} />
            <br />
            <StaggeredLine text={t('hero.line3')} delay={0.55} gradient />
          </h1>
        )}

        {/* MacBook space */}
        <div
          id="hero-macbook-area"
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 820,
            height: 'clamp(220px, 35vh, 400px)',
            margin: '0 auto 0',
            zIndex: 1,
          }}
        />

        {/* ─── Radial base pulsing effect below MacBook ─── */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: 1000,
          height: 120,
          margin: '-10px auto 48px',
          overflow: 'visible',
          zIndex: 12,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}>
          {/* Static warm glow pool */}
          <div style={{
            position: 'absolute', top: -15, left: '15%', right: '15%',
            height: 90,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(255,130,50,0.35) 0%, rgba(255,107,44,0.10) 50%, transparent 80%)',
            animation: 'heroRadialBreathe 4s ease-in-out infinite',
          }} />

          {/* Radial pulse ring 1 — fastest */}
          <div style={{
            position: 'absolute', top: 0, left: '50%',
            width: 200, height: 40,
            borderRadius: '50%',
            border: '1.5px solid rgba(255,153,51,0.45)',
            transform: 'translateX(-50%)',
            animation: 'heroRadialPulse 2.5s ease-out infinite',
          }} />
          {/* Radial pulse ring 2 — delayed */}
          <div style={{
            position: 'absolute', top: 0, left: '50%',
            width: 200, height: 40,
            borderRadius: '50%',
            border: '1px solid rgba(255,153,51,0.30)',
            transform: 'translateX(-50%)',
            animation: 'heroRadialPulse 2.5s ease-out infinite 0.8s',
          }} />
          {/* Radial pulse ring 3 — most delayed */}
          <div style={{
            position: 'absolute', top: 0, left: '50%',
            width: 200, height: 40,
            borderRadius: '50%',
            border: '1px solid rgba(255,153,51,0.18)',
            transform: 'translateX(-50%)',
            animation: 'heroRadialPulse 2.5s ease-out infinite 1.6s',
          }} />

          {/* Downward glow reflection */}
          <div style={{
            position: 'absolute', top: 5, left: '20%', right: '20%',
            height: 60,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(255,130,50,0.22) 0%, transparent 70%)',
            filter: 'blur(10px)',
            animation: 'heroRadialBreathe 3s ease-in-out infinite',
          }} />
        </div>

        <style>{`
          .hero-vignette {
            background: radial-gradient(ellipse 80% 60% at 50% 40%, var(--section-overlay) 0%, transparent 100%);
          }
          @keyframes heroRadialBreathe {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); }
          }
          @keyframes heroRadialPulse {
            0% { transform: translateX(-50%) scale(0.5); opacity: 0.8; }
            100% { transform: translateX(-50%) scaleX(3.5) scaleY(2.5); opacity: 0; }
          }
        `}</style>

        {/* Subtitle — centered, max-width 520px, FIX 2: 32px gap below */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
          style={{
            fontSize: 'clamp(13px, 1.1vw, 16px)', lineHeight: 1.7,
            color: 'var(--text-secondary)', maxWidth: 520,
            fontFamily: 'var(--font-body)',
            margin: '0 auto 32px',
          }}
        >
          {t('hero.subtitle')}
        </motion.p>

        {/* CTAs — centered, FIX 2: 24px gap below */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 1.0 }}
          style={{
            display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="sah-btn sah-btn--primary"
            style={{ boxShadow: '0 4px 20px rgba(var(--sah-accent-1-rgb), 0.25)' }}
          >
            {t('hero.cta1')}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="sah-btn sah-btn--ghost"
          >
            {t('hero.cta2')}
          </motion.button>
        </motion.div>

        {/* Trust Row — centered */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 1.2 }}
          style={{
            display: 'flex', gap: 'clamp(12px, 1.8vw, 24px)',
            flexWrap: 'wrap', justifyContent: 'center',
            paddingTop: 12,
            borderTop: '1px solid var(--glass-border)',
            width: '100%', maxWidth: 460,
            margin: '0 auto',
          }}
        >
          {TRUST_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 8 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1.3 + i * 0.06 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 'clamp(10px, 0.8vw, 12px)',
                  color: 'var(--text-muted)',
                }}
              >
                <Icon size={13} style={{ color: item.color }} />
                <span style={{ fontFamily: 'var(--font-accent)', fontWeight: 600 }}>{item.label}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* ─── Scroll hint ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 0.4, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 1.5 }}
        style={{
          position: 'absolute',
          bottom: 'clamp(16px, 3vh, 32px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          zIndex: 3,
        }}
      >
        <span style={{
          fontSize: 9, letterSpacing: '0.16em', color: 'var(--text-muted)',
          fontFamily: 'var(--font-accent)', textTransform: 'uppercase' as const,
        }}>
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown size={14} style={{ color: 'var(--text-muted)' }} />
        </motion.div>
      </motion.div>
    </section>
  );
}
