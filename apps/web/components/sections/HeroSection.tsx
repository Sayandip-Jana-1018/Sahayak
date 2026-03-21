'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useLocaleStore } from '@/store/localeStore';
import { useThemeStore } from '@/store/themeStore';
import { Lock, Wifi, Globe, Heart } from 'lucide-react';

const Phone3D = dynamic(
  () => import('@/components/hero/Phone3D').then((m) => m.Phone3D),
  { ssr: false }
);

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
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.6, delay: delay + i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            display: 'inline-block', marginRight: '0.22em',
            ...(gradient ? {
              background: 'linear-gradient(135deg, #FF9933 0%, #FFD700 35%, #FF6B35 70%, #FF9933 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 2px 8px rgba(255,153,51,0.25))',
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
  { icon: Lock, label: 'On-device AI', color: '#A855F7' },
  { icon: Wifi, label: 'Works on 2G', color: '#22C55E' },
  { icon: Globe, label: '11 Languages', color: '#0EA5E9' },
  { icon: Heart, label: 'Free forever', color: '#F43F5E' },
];

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });
  const [isMounted, setIsMounted] = useState(false);
  const { t } = useLocaleStore();

  // Scroll-based phone rotation (360°)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const phoneRotateY = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const phoneScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.05, 0.9]);
  const phoneTranslateY = useTransform(scrollYProgress, [0, 1], [0, 120]);

  useEffect(() => { setIsMounted(true); }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'visible',
        padding: 'clamp(100px, 14vh, 140px) 24px clamp(60px, 8vh, 80px)',
      }}
    >
      <div className="sah-container sah-grid sah-grid--hero hero-grid">
        {/* Left: Text & CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560, zIndex: 2 }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, type: 'spring' }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px', borderRadius: 9999, width: 'fit-content',
              background: 'rgba(var(--sah-accent-1-rgb),0.1)',
              border: '1px solid rgba(var(--sah-accent-1-rgb),0.2)',
              fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const,
              color: 'var(--sah-accent-1)',
              fontFamily: 'var(--font-accent)',
            }}
          >
            {t('hero.badge')}
          </motion.div>

          {/* Headline — uses t() for language switching */}
          {isInView && (
            <h1 className="section-heading" style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(42px, 5.5vw, 78px)',
              fontWeight: 800,
              lineHeight: 1.06,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}>
              <StaggeredLine text={t('hero.line1')} delay={0.2} />
              <br />
              <StaggeredLine text={t('hero.line2')} delay={0.45} />
              <br />
              <StaggeredLine text={t('hero.line3')} delay={0.7} gradient />
            </h1>
          )}

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.9 }}
            style={{
              fontSize: 'clamp(14px, 1.1vw, 17px)', lineHeight: 1.7,
              color: 'var(--text-secondary)', maxWidth: 440,
              fontFamily: 'var(--font-body)',
            }}
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 1.1 }}
            style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
          >
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="sah-btn sah-btn--primary"
              style={{ boxShadow: '0 4px 20px rgba(var(--sah-accent-1-rgb), 0.3)' }}
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

          {/* Trust Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 1.3 }}
            style={{
              display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 8,
              paddingTop: 16, borderTop: '1px solid var(--glass-border)',
            }}
          >
            {TRUST_ITEMS.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 1.4 + i * 0.08 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}
                >
                  <Icon size={14} style={{ color: item.color }} />
                  <span style={{ fontFamily: 'var(--font-accent)', fontWeight: 500 }}>{item.label}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Right: Phone with scroll-driven 360° rotation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.3, type: 'spring', bounce: 0.12 }}
          style={{
            position: 'relative',
            height: 'min(70vh, 620px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            perspective: 1200,
          }}
          className="hero-3d"
        >
          {/* Phone container with scroll-linked rotation */}
          <motion.div
            style={{
              rotateY: phoneRotateY,
              scale: phoneScale,
              y: phoneTranslateY,
              transformStyle: 'preserve-3d',
            }}
          >
            {isMounted && <Phone3D />}
          </motion.div>
        </motion.div>

        {/* Mobile phone fallback */}
        <div className="hero-mobile-phone" style={{ display: 'none', textAlign: 'center', marginTop: 20 }}>
          <div style={{
            display: 'inline-block', borderRadius: 28, border: '5px solid #1a1a2e',
            boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
            maxWidth: 180, overflow: 'hidden',
            background: 'linear-gradient(160deg, var(--sah-accent-2), var(--sah-accent-1))',
            aspectRatio: '9/16', width: '100%',
          }}>
            <video src="/videos/hero.mp4" autoPlay loop muted playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </div>
    </section>
  );
}
