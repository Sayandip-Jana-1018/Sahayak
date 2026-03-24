'use client';

import { useRef, useEffect, useState } from 'react';
import { useLocaleStore } from '@/store/localeStore';
import { Mic, Pill, AlertTriangle, Bot, Landmark, LayoutDashboard } from 'lucide-react';

/* ── Bubble data ─────────────────────────────────────────── */
const BUBBLES = [
  { key: 'voice', title: 'Voice Commands', desc: 'Natural speech in 11 Indian languages with dialect recognition.', stat: '11 languages', Icon: Mic, accent: '#FFB432', rgb: '255,180,50', size: 190, left: 8, top: 8, depth: 1 },
  { key: 'med', title: 'Med Scan', desc: 'Camera prescription scan with auto voice reminders.', stat: '65% miss doses', Icon: Pill, accent: '#FF7850', rgb: '255,120,80', size: 185, left: 60, top: 2, depth: 1.05 },
  { key: 'sos', title: 'SOS Emergency', desc: 'Triple-tap, shake, or say "bachao" for instant alerts.', stat: '< 10s response', Icon: AlertTriangle, accent: '#FF5050', rgb: '255,80,80', size: 195, left: 80, top: 24, depth: 1.05 },
  { key: 'companion', title: 'AI Companion', desc: '"Dost" — empathetic AI that chats and detects loneliness.', stat: '24/7 available', Icon: Bot, accent: '#82C8FF', rgb: '130,200,255', size: 180, left: 70, top: 58, depth: 1 },
  { key: 'scheme', title: 'Scheme Finder', desc: 'Eligible government schemes explained in simple Hindi.', stat: '500+ schemes', Icon: Landmark, accent: '#64DC96', rgb: '100,220,150', size: 175, left: 36, top: 62, depth: 0.95 },
  { key: 'family', title: 'Family Dashboard', desc: 'Real-time monitoring: meds, location, battery, SOS.', stat: 'Live tracking', Icon: LayoutDashboard, accent: '#B482FF', rgb: '180,130,255', size: 185, left: 3, top: 50, depth: 0.95 },
];

const CENTER = { left: 38, top: 24, size: 240 };

/* ── Connector geometry helper ───────────────────────────── */
function connectorStyle(b: typeof BUBBLES[0], fieldW: number, fieldH: number) {
  const cx = (CENTER.left / 100) * fieldW + CENTER.size / 2;
  const cy = (CENTER.top / 100) * fieldH + CENTER.size / 2;
  const bx = (b.left / 100) * fieldW + b.size / 2;
  const by = (b.top / 100) * fieldH + b.size / 2;
  const dx = bx - cx;
  const dy = by - cy;
  const len = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  return { len, angle, cx, cy };
}

/* ── Component ───────────────────────────────────────────── */
export function FeaturesGrid() {
  const ref = useRef<HTMLElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const t = useLocaleStore((s) => s.t);

  /* Field size for connector geometry — measured once */
  const fieldSize = { w: 1200, h: 900 };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const rv = () => `orb-reveal ${inView ? 'orb-reveal--on' : ''}`;
  const dl = (d: number): React.CSSProperties => ({ transitionDelay: `${d}ms` });

  return (
    <section ref={ref} id="features"
      style={{ position: 'relative', padding: '80px 0 60px', overflow: 'visible', background: 'transparent' }}>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', padding: '0 24px', background: 'transparent' }}>

        {/* ── Pill badge ── */}
        <div className={`orb-header ${rv()}`} style={dl(0)}>
          <span className="orb-pill-badge">
            <span className="orb-pulse-dot" />
            FEATURES
          </span>
        </div>

        {/* ── Section heading — ALWAYS visible above constellation ── */}
        <h2 className={`orb-section-heading ${rv()}`} style={dl(80)}>
          Everything an <span className="orb-heading-accent">elder needs</span>
        </h2>

        {/* ═══ ORBITAL FIELD (desktop) ═══ */}
        <div className="orb-field" ref={fieldRef}>

          {/* CSS-based connector lines */}
          {BUBBLES.map((b, i) => {
            const { len, angle, cx, cy } = connectorStyle(b, fieldSize.w, fieldSize.h);
            return (
              <div key={`conn-${b.key}`}
                className={`orb-connector ${inView ? 'orb-connector--on' : ''}`}
                style={{
                  left: cx,
                  top: cy,
                  width: len,
                  transform: `rotate(${angle}deg)`,
                  background: `linear-gradient(to right, rgba(${b.rgb},0.5), rgba(${b.rgb},0.08))`,
                  transitionDelay: `${300 + i * 100}ms`,
                  '--conn-accent': b.accent,
                  '--conn-rgb': b.rgb,
                } as React.CSSProperties}
              />
            );
          })}

          {/* Central hero orb */}
          <div className={`orb-hero ${rv()}`}
            style={{ left: `${CENTER.left}%`, top: `${CENTER.top}%`, width: CENTER.size, height: CENTER.size, ...dl(100) }}>
            <div className="orb-hero-glow" />
            <div className="orb-hero-content">
              <span className="orb-hero-hindi">सहायक</span>
              <span className="orb-hero-ai">AI</span>
              {/* 2 sonar ripple rings */}
              <div className="orb-sonar-ring orb-sonar-ring--1" />
              <div className="orb-sonar-ring orb-sonar-ring--2" />
            </div>
          </div>

          {/* Feature bubbles */}
          {BUBBLES.map((b, i) => {
            const isSOS = b.key === 'sos';
            return (
              <div key={b.key}
                className={`orb-bubble ${isSOS ? 'orb-bubble--sos' : ''} ${rv()}`}
                style={{
                  left: `${b.left}%`, top: `${b.top}%`,
                  width: b.size, height: b.size,
                  '--orb-accent': b.accent,
                  '--orb-rgb': b.rgb,
                  transform: `scale(${b.depth})`,
                  opacity: b.depth < 1 ? 0.85 : 1,
                  ...dl(180 + i * 80),
                } as React.CSSProperties}
              >
                <div className="orb-bubble-glow" style={{
                  background: `radial-gradient(circle at center, rgba(${b.rgb},0.35) 0%, transparent 65%)`,
                }} />
                <div className="orb-bubble-specular" />

                {isSOS && (
                  <div className="orb-live-badge">
                    <span className="orb-live-dot" />LIVE
                  </div>
                )}

                <div className="orb-bubble-inner">
                  <div className="orb-bubble-icon" style={{
                    background: `rgba(${b.rgb},0.15)`,
                    border: `1px solid rgba(${b.rgb},0.35)`,
                  }}>
                    <b.Icon size={24} strokeWidth={1.5} style={{ color: b.accent }} />
                  </div>
                  <h3 className="orb-bubble-title">{b.title}</h3>
                  <p className="orb-bubble-desc">{b.desc}</p>
                </div>

                <div className="orb-tooltip" style={{ borderColor: `rgba(${b.rgb},0.4)` }}>
                  <span style={{ color: b.accent }}>{b.stat}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ═══ MOBILE FALLBACK ═══ */}
        <div className="orb-mobile-grid">
          {BUBBLES.map((b, i) => {
            const isSOS = b.key === 'sos';
            return (
              <div key={b.key}
                className={`orb-mob-card ${isSOS ? 'orb-mob-card--sos' : ''} ${rv()}`}
                style={dl(i * 80)}
              >
                <div className="orb-mob-glow" style={{
                  background: `radial-gradient(circle, rgba(${b.rgb},0.2) 0%, transparent 70%)`,
                }} />
                {isSOS && (
                  <div className="orb-live-badge orb-live-badge--mob"><span className="orb-live-dot" />LIVE</div>
                )}
                <div className="orb-bubble-icon orb-mob-icon" style={{
                  background: `rgba(${b.rgb},0.15)`,
                  border: `1px solid rgba(${b.rgb},0.35)`,
                }}>
                  <b.Icon size={22} strokeWidth={1.5} style={{ color: b.accent }} />
                </div>
                <h3 className="orb-bubble-title">{b.title}</h3>
                <p className="orb-bubble-desc">{b.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
