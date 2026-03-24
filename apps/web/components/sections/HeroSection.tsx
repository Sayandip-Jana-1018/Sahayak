'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLocaleStore } from '@/store/localeStore';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Lock, Wifi, Globe, Heart, ArrowDown } from 'lucide-react';
import { MacTerminal } from '@/components/sections/MacTerminal';

function StaggeredLine({ text, delay = 0, gradient = false, textShadow, textStroke }: {
  text: string; delay?: number; gradient?: boolean; textShadow?: string; textStroke?: string;
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
            textShadow, WebkitTextStroke: textStroke,
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

/* ── Line3: "Meet" normal → "~" normal → "Sahayak" orange gradient ── */
function HeroLine3({ text, delay = 0, textShadow, textStroke, orangeShadow }: {
  text: string; delay?: number; textShadow?: string; textStroke?: string; orangeShadow?: string;
}) {
  const words = text.split(' ');
  const firstWord = words[0]; // "Meet" / "मिलिए"
  const rest = words.slice(1).join(' '); // '"Sahayak".'

  return (
    <span style={{ display: 'inline' }}>
      {/* "Meet" in heading color */}
      <motion.span
        initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ display: 'inline-block', marginRight: '0.18em', textShadow, WebkitTextStroke: textStroke }}
      >
        {firstWord}
      </motion.span>
      {/* "~" in heading color */}
      <motion.span
        initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.55, delay: delay + 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ display: 'inline-block', marginRight: '0.18em', opacity: 0.6, textShadow, WebkitTextStroke: textStroke }}
      >
        ~
      </motion.span>
      {/* "Sahayak". in orange gradient */}
      {rest.split(' ').map((word, i) => (
        <motion.span
          key={`grad-${i}`}
          initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.55, delay: delay + (i + 2) * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            display: 'inline-block', marginRight: '0.18em',
            background: 'linear-gradient(90deg, #FF6B2C 0%, #FF9A5C 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            paddingBottom: '0.12em',
            lineHeight: '1.2',
            textShadow: orangeShadow,
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

/* ── Floating Background Elements ── */
const FLOATING_ELEMENTS = [
  { id: 1, type: 'emoji', content: '👵🏾', top: '15%', left: '8%',   speed: -0.4, rotate: -10 },
  { id: 2, type: 'text',  content: 'Hello?', top: '22%', left: '82%',  speed: -0.7, rotate: 12 },
  { id: 3, type: 'emoji', content: '🇮🇳',  top: '45%', left: '12%',  speed: -0.2, rotate: -15 },
  { id: 4, type: 'text',  content: 'नमस्ते',  top: '12%', left: '70%',  speed: -0.5, rotate: -6 },
  { id: 5, type: 'emoji', content: '🗣️',  top: '55%', left: '86%',  speed: -0.8, rotate: 20 },
  { id: 6, type: 'text',  content: 'Easy!',  top: '68%', left: '9%',   speed: -0.3, rotate: -12 },
  { id: 7, type: 'emoji', content: '🌟',  top: '32%', left: '92%',  speed: -0.6, rotate: 5 },
];

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.12 });
  const { t } = useLocaleStore();
  const router = useRouter();
  
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === 'dark' : true;

  /* ── Parallax floating elements ── */
  useEffect(() => {
    const tick = () => {
      if (!sectionRef.current) {
        requestAnimationFrame(tick);
        return;
      }
      const rect = sectionRef.current.getBoundingClientRect();
      const scrolled = Math.max(0, -rect.top);

      const floaters = sectionRef.current.querySelectorAll('.hero-float') as NodeListOf<HTMLElement>;
      floaters.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-speed') || '0');
        const rotate = el.getAttribute('data-rotate') || '0';
        el.style.transform = `translateY(${scrolled * speed}px) rotate(${rotate}deg)`;
      });

      // Blur and fade the text block as it scrolls out of view and the terminal scrolls up over it.
      if (textRef.current) {
        // Range 50px to 350px scrolled will gently transition text opacity from 1 -> 0.6 and add moderate blur
        const progress = Math.max(0, Math.min(1, (scrolled - 50) / 300));
        textRef.current.style.opacity = `${1 - (progress * 0.4)}`; // Never drops below 0.6 opacity (highly visible)
        textRef.current.style.filter = `blur(${progress * 8}px)`; // Max 8px blur (readable shape)
        textRef.current.style.transform = `scale(${1 - progress * 0.05})`;
      }

      requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* 3D text shadow — deep extrusion effect targeting text directly */
  const text3dShadow = isDark
    ? `0 1px 0 #64748b, 0 2px 0 #475569, 0 3px 0 #334155, 0 4px 0 #1e293b, 0 5px 0 #0f172a, 0 8px 16px rgba(0,0,0,0.8), 0 16px 32px rgba(0,0,0,0.5)`
    : `0 1px 0 #cbd5e1, 0 2px 0 #94a3b8, 0 3px 0 #718096, 0 4px 0 #475569, 0 5px 0 #334155, 0 8px 16px rgba(0,0,0,0.2), 0 16px 32px rgba(27,42,74,0.15)`;

  const orange3dShadow = isDark
    ? `0 1px 0 #c84000, 0 2px 0 #a63500, 0 3px 0 #852a00, 0 4px 0 #652000, 0 5px 0 #501500, 0 8px 16px rgba(0,0,0,0.8)`
    : `0 1px 0 #ff9a5c, 0 2px 0 #ff833b, 0 3px 0 #e65c22, 0 4px 0 #cc4c15, 0 5px 0 #a63500, 0 8px 16px rgba(0,0,0,0.2)`;

  const textStroke = isDark ? '1px rgba(255,255,255,0.1)' : '1px rgba(0,0,0,0.05)';

  return (
    <section
      ref={sectionRef}
      id="hero"
      style={{
        position: 'relative',
        display: 'block',
        overflow: 'visible',
        padding: '0 clamp(16px, 4vw, 48px)',
      }}
    >
      {/* ─── Stickiness Bounding Container ─── */}
      <div style={{ position: 'relative' }}>

        {/* ─── Floating Elements Layer ─── */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 3 }}>
          {FLOATING_ELEMENTS.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2 + item.id * 0.1, type: 'spring' }}
              className="hero-float"
              data-speed={item.speed}
              data-rotate={item.rotate || 0}
              style={{
                position: 'absolute',
                top: item.top,
                left: item.left,
                fontSize: item.type === 'emoji' ? 'clamp(32px, 3.5vw, 48px)' : 'clamp(14px, 1.5vw, 20px)',
                fontWeight: 800,
                fontFamily: item.type === 'text' ? 'var(--font-display)' : undefined,
                color: 'var(--text-muted)',
                transform: `rotate(${item.rotate || 0}deg)`,
                willChange: 'transform',
              }}
            >
              {item.content}
            </motion.div>
          ))}
        </div>

        {/* ─── Text Block — STICKY: stays pinned while terminal scrolls over it ─── */}
        <div
          ref={textRef}
          style={{
            position: 'sticky',
            top: '8vh',
            zIndex: 2,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            willChange: 'transform, opacity, filter',
            paddingTop: 'clamp(40px, 8vh, 100px)',
          }}
        >
          {/* Badge */}
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
              marginBottom: 28,
            }}
          >
            {t('hero.badge')}
          </motion.div>

          {/* H1 — 3D extruded text */}
          {isInView && (
            <h1 className="hero-text-3d" style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(54px, 8vw, 110px)',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              textAlign: 'center',
              color: isDark ? 'var(--text-primary)' : '#111822',
              margin: '0 auto 12px',
              paddingBottom: '20px',
              maxWidth: 1100,
            }}>
              <StaggeredLine text={t('hero.line1')} delay={0.15} textShadow={text3dShadow} textStroke={textStroke} />
              <br />
              <StaggeredLine text={t('hero.line2')} delay={0.35} textShadow={text3dShadow} textStroke={textStroke} />
              <br />
              <HeroLine3 text={t('hero.line3')} delay={0.55} textShadow={text3dShadow} textStroke={textStroke} orangeShadow={orange3dShadow} />
            </h1>
          )}
        </div>

        {/* ─── Mac Terminal — scrolls up OVER the sticky text ─── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 960,
            margin: '0 auto',
            paddingTop: '10vh', /* Pulled up from 15vh */
            paddingBottom: '4vh',
            zIndex: 12,
          }}
        >
            <MacTerminal scrollOpacity={1} />
        </motion.div>
      </div> {/* End stickiness bounding container */}

      {/* ─── Bottom CTA & Subtitle ─── */}
      <div style={{ width: '100%', paddingBottom: '12vh', paddingTop: '6vh', position: 'relative', zIndex: 10 }}>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
          style={{
            textAlign: 'center',
            fontSize: 'clamp(14px, 1.2vw, 18px)', lineHeight: 1.6,
            color: 'var(--text-secondary)', maxWidth: 640,
            fontFamily: 'var(--font-body)',
            margin: '0 auto 28px',
          }}
        >
          {t('hero.subtitle')}
        </motion.p>

        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 1.0 }}
            style={{
              display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center',
              marginBottom: 24,
            }}
          >
          {/* Glassmorphic Primary Button */}
          <motion.button
            onClick={() => router.push('/login')}
            whileHover={{ scale: 1.03, y: -2, background: 'rgba(255, 107, 44, 0.4)' }}
            whileTap={{ scale: 0.97 }}
            className="sah-btn"
            style={{ 
              background: 'rgba(255, 107, 44, 0.25)',
              border: '1px solid rgba(255, 107, 44, 0.6)',
              boxShadow: '0 8px 32px rgba(255, 107, 44, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              color: isDark ? '#ffffff' : '#4a2000',
              fontWeight: isDark ? 600 : 700,
              fontSize: '15px',
              padding: '14px 32px',
              cursor: 'pointer',
            }}
          >
            Start Free — No Card Needed
          </motion.button>

          {/* Glassmorphic Secondary Button */}
          <motion.button
            onClick={() => { document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}
            whileHover={{ scale: 1.03, y: -2, background: 'rgba(255, 255, 255, 0.12)' }}
            whileTap={{ scale: 0.97 }}
            className="sah-btn"
            style={{ 
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.18)' : '1px solid rgba(0, 0, 0, 0.12)',
              boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.12)' : '0 8px 32px rgba(0, 0, 0, 0.05)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
              fontWeight: isDark ? 600 : 700,
              fontSize: '15px',
              padding: '14px 32px',
              cursor: 'pointer',
            }}
          >
            See How It Works ↓
          </motion.button>
        </motion.div>

        {/* Trust Row */}
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
          left: '50%',
          transform: 'translateX(-50%)',
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
