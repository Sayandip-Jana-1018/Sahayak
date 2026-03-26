'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import CountUp from 'react-countup';
import { useLocaleStore } from '@/store/localeStore';

/* ── SVG Icons ───────────────────────────────────────────── */

const SeniorIcon = ({ color = '#FF5C0A' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4" />
    <path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2" />
  </svg>
);

const MedicationIcon = ({ color = '#F0B429' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4.5" y="2" width="15" height="20" rx="5" />
    <line x1="4.5" y1="12" x2="19.5" y2="12" />
    <line x1="12" y1="7" x2="12" y2="17" />
  </svg>
);

const DigitalIcon = ({ color = '#5DE4A0' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="7" y="2" width="10" height="20" rx="2" />
    <line x1="7" y1="18" x2="17" y2="18" />
    <line x1="11" y1="21" x2="13" y2="21" />
    <line x1="4" y1="4" x2="20" y2="20" />
  </svg>
);

const HomeIcon = ({ color = '#78AAFF' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5L12 3l9 7.5" />
    <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
    <rect x="9" y="14" width="6" height="7" rx="0.5" />
  </svg>
);

/* ── Stat data ───────────────────────────────────────────── */

const STATS = [
  {
    value: 65,
    suffix: '%',
    labelKey: 'problem.stat1.label',
    fallback: 'Miss critical medications\nregularly',
    accent: '#F0B429',
    rgb: '240,180,41',
    Icon: MedicationIcon,
  },
  {
    value: 73,
    suffix: '%',
    labelKey: 'problem.stat2.label',
    fallback: 'Feel digitally excluded\nfrom modern life',
    accent: '#5DE4A0',
    rgb: '100,228,160',
    Icon: DigitalIcon,
  },
  {
    value: 48,
    suffix: '%',
    labelKey: 'problem.stat3.label',
    fallback: 'Live alone or only\nwith spouse',
    accent: '#78AAFF',
    rgb: '120,170,255',
    Icon: HomeIcon,
  },
];

/* ── Component ───────────────────────────────────────────── */

export function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [mouseOff, setMouseOff] = useState({ x: 0, y: 0 });
  const t = useLocaleStore((s) => s.t);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const onMouse = useCallback((e: React.MouseEvent) => {
    const r = sectionRef.current?.getBoundingClientRect();
    if (!r) return;
    setMouseOff({
      x: ((e.clientX - r.left - r.width / 2) / r.width) * 40,
      y: ((e.clientY - r.top - r.height / 2) / r.height) * 28,
    });
  }, []);

  const v = (d = 0) => ({
    className: `psec-reveal ${inView ? 'psec-reveal--on' : ''}`,
    style: { transitionDelay: `${d}ms` } as React.CSSProperties,
  });
  const vScale = (d = 0) => ({
    className: `psec-reveal-scale ${inView ? 'psec-reveal-scale--on' : ''}`,
    style: { transitionDelay: `${d}ms` } as React.CSSProperties,
  });
  const vRight = (d = 0) => ({
    className: `psec-reveal-right ${inView ? 'psec-reveal-right--on' : ''}`,
    style: { transitionDelay: `${d}ms` } as React.CSSProperties,
  });

  // Translated strings
  const badge = t('section.problem') || 'The Problem';
  const eyebrow = t('problem.eyebrow') || 'India · 140 Million Seniors';
  const h1 = t('problem.headline.pre') || "India\u2019s Elders Are Being ";
  const h1hl = t('problem.headline.highlight') || 'Left Behind';
  const sub = t('problem.subtext') || '140 million seniors in India struggle daily with smartphones that were never designed for them \u2014 missing medications, unable to call for help, and feeling increasingly isolated in a digital world.';
  const cta1 = t('problem.cta1') || 'See the Impact';
  const cta2 = t('problem.cta2') || 'How it works \u2192';
  const spop = t('problem.seniorPop') || 'Senior Population';
  const sdesc = t('problem.seniorDesc') || 'Senior citizens across India in 2024';
  const quote = t('problem.quote') || '\u201Cमेरे बच्चे कहते हैं फोन से सब हो जाता है, पर मुझे तो बटन भी नहीं दिखते।\u201D';
  const qattr = t('problem.quoteAttrib') || 'Kamla Devi, 72 \u00B7 Varanasi';
  const mlab = t('problem.missed.label') || 'AVG. MISSED DOSES / MONTH';
  const msub = t('problem.missed.sub') || 'Per senior without a reminder system';

  return (
    <section ref={sectionRef} id="problem" onMouseMove={onMouse}
      style={{ position: 'relative', padding: 'clamp(80px, 10vw, 140px) 0', overflow: 'hidden', background: 'transparent' }}>

      {/* ── Ambient orbs ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div className="psec-orb" style={{ top: '-10%', left: '-8%', width: 700, height: 700,
          background: 'radial-gradient(circle, #7A2200 0%, transparent 70%)', animation: 'psecOrb1 22s ease-in-out infinite', opacity: 0.35 }} />
        <div className="psec-orb" style={{ bottom: '-15%', right: '-10%', width: 500, height: 500,
          background: 'radial-gradient(circle, #3A4800 0%, transparent 70%)', animation: 'psecOrb2 28s ease-in-out infinite reverse', opacity: 0.3 }} />
        <div className="psec-orb" style={{ top: '40%', left: '45%', width: 380, height: 380,
          background: 'radial-gradient(circle, rgba(255,92,10,0.35) 0%, transparent 70%)',
          transform: `translate(${mouseOff.x}px, ${mouseOff.y}px)`, transition: 'transform 0.15s ease-out', opacity: 0.3 }} />
        <div className="psec-orb" style={{ bottom: '10%', left: '5%', width: 260, height: 260,
          background: 'radial-gradient(circle, rgba(240,180,41,0.35) 0%, transparent 70%)', animation: 'psecOrb4 24s ease-in-out infinite', opacity: 0.25 }} />
      </div>

      {/* ── Content ── */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* ═══ ROW 1 — HERO SPLIT ═══ */}
        <div className="psec-hero-grid">
          {/* Left 58% */}
          <div>
            {/* Pill badge */}
            <div {...v(0)}>
              <span className="psec-pill-badge">
                <span className="psec-pulse-dot" />
                {badge}
              </span>
            </div>

            {/* Eyebrow */}
            <p {...v(100)} className={`psec-eyebrow ${v(100).className}`}>{eyebrow}</p>

            {/* Headline */}
            <h2 {...v(220)} className={`psec-headline ${v(220).className}`}>
              {h1}
              <span className="psec-shimmer-text">{h1hl}</span>
            </h2>

            {/* Subtext */}
            <p {...v(340)} className={`psec-subtext ${v(340).className}`}>{sub}</p>

            {/* CTAs */}
            <div {...v(440)} className={`psec-cta-row ${v(440).className}`}>
              <button className="psec-cta-primary">{cta1}</button>
              <button className="psec-cta-ghost">{cta2}</button>
            </div>
          </div>

          {/* Right 42% — Featured card */}
          <div {...vRight(300)} className={`psec-glass-card psec-featured ${vRight(300).className}`}>
            {/* Shimmer top line */}
            <div className="psec-shimmer-line" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />
            {/* Accent glow blob */}
            <div className="psec-blob" style={{ background: '#FF5C0A', top: -40, right: -40 }} />

            <span className="psec-tag">{spop}</span>

            <div className="psec-icon-box" style={{ background: 'rgba(255,92,10,0.1)', border: '1px solid rgba(255,92,10,0.2)' }}>
              <SeniorIcon />
            </div>

            <div className="psec-big-number" style={{ background: 'linear-gradient(135deg, #FF5C0A, #F0B429)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {inView ? <CountUp start={0} end={140} duration={2} suffix="M+" useEasing /> : '0M+'}
            </div>

            <div className="psec-divider" style={{ background: 'linear-gradient(90deg, #FF5C0A, transparent)' }} />
            <p className="psec-desc">{sdesc}</p>

            <div className="psec-pills-row">
              <span className="psec-mini-pill">🇮🇳 India · 2024</span>
              <span className="psec-mini-pill psec-mini-pill--accent psec-float-badge">+3M per year</span>
            </div>
          </div>
        </div>

        {/* ── Separator ── */}
        <div className="psec-separator" />

        {/* ═══ ROW 2 — BENTO STAT CARDS ═══ */}
        <div className="psec-bento-grid">
          {STATS.map((s, i) => {
            const label = t(s.labelKey);
            const txt = label === s.labelKey ? s.fallback : label;
            return (
              <div key={s.labelKey} {...vScale(i * 120)}
                className={`psec-glass-card psec-stat-card ${vScale(i * 120).className}`}
              >
                {/* Top accent line */}
                <div className="psec-top-accent" style={{ background: s.accent }} />
                {/* Corner blob */}
                <div className="psec-blob" style={{ background: s.accent, top: -30, right: -30, width: 120, height: 120 }} />

                {/* Icon */}
                <div className="psec-icon-box" style={{ background: `rgba(${s.rgb},0.1)`, border: `1px solid rgba(${s.rgb},0.2)` }}>
                  <s.Icon color={s.accent} />
                </div>

                {/* Number */}
                <div className="psec-stat-number" style={{ color: s.accent }}>
                  {inView ? <CountUp start={0} end={s.value} duration={1.6} suffix={s.suffix} useEasing /> : `0${s.suffix}`}
                </div>

                {/* Divider */}
                <div className="psec-divider" style={{ background: `linear-gradient(90deg, ${s.accent}, transparent)` }} />

                {/* Label */}
                <p className="psec-stat-label">{txt}</p>

                {/* Progress bar */}
                <div className="psec-progress" style={{
                  background: `linear-gradient(90deg, ${s.accent}, rgba(${s.rgb},0.3))`,
                  width: inView ? `${s.value}%` : '0%',
                }} />
              </div>
            );
          })}
        </div>

        {/* ═══ ROW 3 — QUOTE STRIP ═══ */}
        <div className="psec-quote-grid">
          {/* Left — Quote */}
          <div {...v(100)} className={`psec-glass-card psec-quote-card ${v(100).className}`}>
            <div className="psec-blob" style={{ background: '#FF5C0A', top: -40, right: -40 }} />
            {/* Decorative mark */}
            <div className="psec-quote-mark" aria-hidden>&ldquo;</div>
            <p className="psec-quote-text">{quote}</p>
            <div className="psec-quote-attrib">
              <div className="psec-attrib-line" />
              <span>— {qattr}</span>
            </div>
          </div>

          {/* Right — Micro stat */}
          <div {...v(200)} className={`psec-glass-card psec-micro-card ${v(200).className}`}>
            <div className="psec-blob" style={{ background: '#F0B429', bottom: -30, left: -30, top: 'auto', right: 'auto' }} />
            <span className="psec-micro-label">{mlab}</span>
            <div className="psec-big-number psec-micro-number" style={{
              background: 'linear-gradient(135deg, #FF5C0A, #F0B429)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {inView ? <CountUp start={0} end={8.4} decimals={1} duration={1.8} useEasing /> : '0.0'}
            </div>
            <div className="psec-divider" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,92,10,0.4), transparent)', width: 36, margin: '10px auto 12px' }} />
            <p className="psec-micro-sub">{msub}</p>
          </div>
        </div>

      </div>
    </section>
  );
}
