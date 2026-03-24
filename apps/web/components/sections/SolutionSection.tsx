'use client';

import { useRef, useEffect, useState } from 'react';
import { useLocaleStore } from '@/store/localeStore';
import { Mic, Pill, AlertTriangle, Bot, Landmark, LayoutDashboard, HeartPulse } from 'lucide-react';

/* ── Hex polygon clip-path (flat-top) ───────────────────── */
const HEX_CLIP = 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)';

/* ── All 6 features ─────────────────────────────────────── */
const ALL_FEATURES = [
  { key: 'voice', title: 'Voice Commands', desc: 'Speak naturally in 11 Indian languages — understands dialects and elderly speech.', Icon: Mic, accentSolid: '#FFB432', rgb: '255,180,50' },
  { key: 'med', title: 'Med Reminders', desc: 'Scan prescriptions with camera. Auto-sets reminders with gentle voice alerts.', Icon: Pill, accentSolid: '#FF7850', rgb: '255,120,80' },
  { key: 'sos', title: 'SOS Emergency', desc: 'Triple-tap, shake, or say "bachao." Instant alerts with live GPS location.', Icon: AlertTriangle, accentSolid: '#FF5050', rgb: '255,80,80' },
  { key: 'companion', title: 'AI Companion', desc: '"Dost" — an empathetic AI friend that chats and detects loneliness.', Icon: Bot, accentSolid: '#82C8FF', rgb: '130,200,255' },
  { key: 'scheme', title: 'Scheme Finder', desc: 'Discovers eligible government welfare schemes in simple Hindi.', Icon: Landmark, accentSolid: '#64DC96', rgb: '100,220,150' },
  { key: 'family', title: 'Family Dashboard', desc: 'Real-time caregiver monitoring: meds, location, battery, SOS history.', Icon: LayoutDashboard, accentSolid: '#B482FF', rgb: '180,130,255' },
  { key: 'wellness', title: 'Daily Wellness', desc: 'Morning check-ins, mood tracking, and gentle exercise reminders for holistic care.', Icon: HeartPulse, accentSolid: '#FF82B4', rgb: '255,130,180' },
];

const MARQUEE_ITEMS = [
  { name: 'Voice Commands', rgb: '255,180,50' },
  { name: 'Medication Reminders', rgb: '255,120,80' },
  { name: 'SOS Emergency', rgb: '255,80,80' },
  { name: 'AI Companion', rgb: '130,200,255' },
  { name: 'Scheme Finder', rgb: '100,220,150' },
  { name: 'Family Dashboard', rgb: '180,130,255' },
];

/* ── Component ───────────────────────────────────────────── */
export function SolutionSection() {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const t = useLocaleStore((s) => s.t);

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

  const rv = () => `sol-reveal ${inView ? 'sol-reveal--on' : ''}`;
  const delay = (d: number): React.CSSProperties => ({ transitionDelay: `${d}ms` });
  const sub = t('solution.sub') || 'Seven powerful features designed with love for India\u2019s elders.';

  const topRow = ALL_FEATURES.slice(0, 3);
  const botRow = ALL_FEATURES.slice(3, 7);

  return (
    <section ref={ref} id="solution"
      style={{ position: 'relative', padding: 'clamp(80px, 10vw, 140px) 0', overflow: 'hidden', background: 'transparent' }}>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* ═══ HEADER ═══ */}
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <div className={rv()} style={delay(0)}>
            <span className="sol-pill-badge">
              <span className="sol-pulse-dot" />
              THE SOLUTION
            </span>
          </div>
          <h2 className={`sol-headline ${rv()}`} style={delay(120)}>
            <span className="sol-headline-meet">Meet </span>
            <span className="sol-headline-hindi">सहायक</span>
          </h2>
          <p className={`sol-subtext ${rv()}`} style={delay(240)}>{sub}</p>
          <div className={`sol-rule ${inView ? 'sol-rule--on' : ''}`} style={{ ...delay(360), margin: '0 auto' }} />
          <div className={rv()} style={{ ...delay(200), marginTop: 16 }}>
            <span className="sol-count-pill">7 Features</span>
          </div>
        </div>

        {/* ═══ MARQUEE STRIP ═══ */}
        <div className="sol-marquee-wrap">
          <div className="sol-marquee-fade sol-marquee-fade--left" />
          <div className="sol-marquee-fade sol-marquee-fade--right" />
          <div className="sol-marquee-track">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((m, i) => (
              <span key={`${m.name}-${i}`} className="sol-marquee-pill">
                <span className="sol-marquee-dot" style={{ background: `rgb(${m.rgb})` }} />
                {m.name}
              </span>
            ))}
          </div>
        </div>

        {/* ═══ HONEYCOMB GRID ═══ */}
        <div className="sol-honeycomb-section">

          {/* Background hex wireframe pattern */}
          <div className="sol-hex-bg-pattern" aria-hidden>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="hexPattern" width="120" height="104" patternUnits="userSpaceOnUse" patternTransform="translate(0,0)">
                  <polygon points="60,0 112,26 112,78 60,104 8,78 8,26" fill="none" stroke="currentColor" strokeWidth="0.6" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hexPattern)" />
            </svg>
          </div>

          {/* Row 1 — top 3 hexes */}
          <div className="sol-hex-row">
            {topRow.map((f, i) => {
              const isSOS = f.key === 'sos';
              const idx = i; // reading order: 0,1,2
              return (
                <div key={f.key}
                  className={`sol-hex-cell ${isSOS ? 'sol-hex-cell--sos' : ''} ${rv()}`}
                  style={delay(idx * 80)}
                >
                  <div className="sol-hex-card">
                    <div
                      className={`sol-hex-clipped ${isSOS ? 'sol-hex-sos' : ''}`}
                      style={{ clipPath: HEX_CLIP }}
                    >
                      <div className="sol-hex-blob" style={{ background: f.accentSolid }} />
                      {isSOS && <div className="sol-sos-glow" />}

                      {isSOS && (
                        <div className="sol-live-badge">
                          <span className="sol-live-dot" />
                          LIVE
                        </div>
                      )}

                      <div className="sol-hex-content">
                        <div className="sol-icon-box sol-hex-icon" style={{
                          background: `rgba(${f.rgb},0.12)`,
                          border: `1px solid rgba(${f.rgb},0.3)`,
                        }}>
                          <f.Icon size={22} strokeWidth={1.5} style={{ color: f.accentSolid }} />
                        </div>
                        <h3 className="sol-hex-title">{f.title}</h3>
                        <p className="sol-hex-desc">{f.desc}</p>
                      </div>
                    </div>

                    {/* SVG hex outline */}
                    <svg className="sol-hex-svg-outline" viewBox="0 0 200 173.2" preserveAspectRatio="none">
                      <polygon
                        points="100,0 186.6,43.3 186.6,129.9 100,173.2 13.4,129.9 13.4,43.3"
                        fill="none"
                        stroke={isSOS ? 'rgba(255,60,60,0.6)' : `rgba(${f.rgb},0.35)`}
                        strokeWidth={isSOS ? '1.8' : '1.2'}
                        className="sol-hex-stroke"
                      />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Row 2 — bottom 3 hexes (offset for true honeycomb) */}
          <div className="sol-hex-row sol-hex-row--offset">
            {botRow.map((f, i) => {
              const idx = 3 + i; // reading order: 3,4,5
              return (
                <div key={f.key}
                  className={`sol-hex-cell ${rv()}`}
                  style={delay(idx * 80)}
                >
                  <div className="sol-hex-card">
                    <div className="sol-hex-clipped" style={{ clipPath: HEX_CLIP }}>
                      <div className="sol-hex-blob" style={{ background: f.accentSolid }} />

                      <div className="sol-hex-content">
                        <div className="sol-icon-box sol-hex-icon" style={{
                          background: `rgba(${f.rgb},0.12)`,
                          border: `1px solid rgba(${f.rgb},0.3)`,
                        }}>
                          <f.Icon size={22} strokeWidth={1.5} style={{ color: f.accentSolid }} />
                        </div>
                        <h3 className="sol-hex-title">{f.title}</h3>
                        <p className="sol-hex-desc">{f.desc}</p>
                      </div>
                    </div>

                    <svg className="sol-hex-svg-outline" viewBox="0 0 200 173.2" preserveAspectRatio="none">
                      <polygon
                        points="100,0 186.6,43.3 186.6,129.9 100,173.2 13.4,129.9 13.4,43.3"
                        fill="none"
                        stroke={`rgba(${f.rgb},0.35)`}
                        strokeWidth="1.2"
                        className="sol-hex-stroke"
                      />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
