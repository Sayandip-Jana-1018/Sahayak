'use client';

import React, { useRef, useEffect, useState, CSSProperties } from 'react';
import CountUp from 'react-countup';
import { useLocaleStore } from '@/store/localeStore';

const METRICS = [
  { 
    id: 'u', key: 'users', value: 140, suffix: 'M+', label: 'Potential Users', 
    desc: 'Senior citizens in India who could benefit', micro: 'Largest senior population globally', 
    accent: '#FF8C45', rgb: '255,140,69', 
    delayBase: 0, fontSize: 'clamp(44px, 5vw, 64px)'
  },
  { 
    id: 'l', key: 'langs', value: 11, suffix: '', label: 'Languages', 
    desc: 'Full voice & UI support', micro: 'Hindi, Tamil, Bengali + 8 more', 
    accent: '#F0B429', rgb: '240,180,41', 
    delayBase: 100, fontSize: 'clamp(44px, 5vw, 64px)'
  },
  { 
    id: 'r', key: 'resp', value: 4, suffix: 's', label: 'Avg Response', 
    desc: 'Voice command to action time', micro: 'Faster than calling 112', 
    accent: '#FF6B4A', rgb: '255,107,74', 
    delayBase: 200, fontSize: 'clamp(44px, 5vw, 64px)'
  },
  { 
    id: 'up', key: 'uptime', value: 99.9, suffix: '%', label: 'Uptime SLA', 
    desc: "Because emergencies don't wait", micro: '364.9 days/year online', 
    accent: '#FFFFFF', rgb: '255,255,255', 
    delayBase: 300, fontSize: 'clamp(44px, 5vw, 64px)'
  },
  { 
    id: 's', key: 'schemes', value: 50, suffix: '+', label: 'Govt Schemes', 
    desc: 'Auto-discovered for each elder', micro: 'PMJAY, Atal Pension + more', 
    accent: '#64DC96', rgb: '100,220,150', 
    delayBase: 400, fontSize: 'clamp(44px, 5vw, 64px)'
  },
  { 
    id: 'f', key: 'free', value: 0, suffix: '', label: '₹0 for Families', 
    desc: 'Free tier — always and forever', micro: 'Core features free forever', 
    accent: '#F5C842', rgb: '245,200,66', 
    delayBase: 500, fontSize: 'clamp(44px, 5vw, 64px)'
  },
];

const TICKER_ITEMS = [
  '140M+ Potential Users', '11 Languages', '4s Response', 
  '99.9% Uptime', '50+ Schemes', '₹0 for Families'
];

export function ImpactNumbers() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const { t } = useLocaleStore();

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

  const rv = `kin-reveal ${inView ? 'kin-reveal--on' : ''}`;
  const getDelay = (d: number): CSSProperties => ({ transitionDelay: `${d}ms` });

  return (
    <section ref={sectionRef} id="impact" className="kin-section-transparent"
      style={{
        position: 'relative',
        padding: 'clamp(100px, 12vw, 160px) 0 80px',
        background: 'transparent !important',
        overflow: 'hidden'
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', background: 'transparent !important', position: 'relative', zIndex: 2 }}>
        
        {/* ── Section Header ── */}
        <div className={`kin-header ${rv}`} style={{ padding: '0 24px', ...getDelay(0) }}>
          <span className="kin-pill-badge">
            <span className="kin-pulse-dot" />
            IMPACT
          </span>
          <h2 className="kin-heading" style={{ maxWidth: 600, margin: '0 auto' }}>
            Numbers that<br />
            <span className="kin-heading-accent">matter</span>
          </h2>
          <div className="kin-divider" />
          <p className="kin-subtitle">
            Real impact. Real families. Real India.
          </p>
        </div>

      </div>

      {/* ── Marquee Ticker ── */}
      <div className={`kin-ticker-wrap ${rv}`} style={{ zIndex: 10, margin: '0 auto 48px', maxWidth: '70%', position: 'relative', ...getDelay(100) }}>
        {/* Blur fades */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 80, zIndex: 2, pointerEvents: 'none', background: 'linear-gradient(to right, rgba(0,0,0,0.6), transparent)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 80, zIndex: 2, pointerEvents: 'none', background: 'linear-gradient(to left, rgba(0,0,0,0.6), transparent)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} />
        <div className="kin-ticker">
          <div className="kin-ticker-content">
            {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <React.Fragment key={i}>
                <span>{item}</span>
                <span className="kin-ticker-dot">◆</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── Oval Grid Layout ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', background: 'transparent !important', padding: '0 24px' }}>
        <div className="kin-grid">
          {METRICS.map((m) => {
            return (
              <div key={m.key} className={`kin-oval-wrap ${rv}`} style={{ ...getDelay(200 + m.delayBase) } as CSSProperties}>
                {/* Glowing background blob */}
                <div className="kin-oval-glow" style={{ background: m.accent }} />
                
                {/* Main glass oval card */}
                <div className="kin-oval" style={{ '--kin-accent': m.accent, '--kin-rgb': m.rgb } as CSSProperties}>
                  
                  {/* Top Third: Numbers */}
                  <div className="kin-oval-top">
                    <div className="kin-oval-number" style={{ 
                      color: m.accent, 
                      fontSize: m.fontSize,
                      textShadow: `0 0 12px rgba(${m.rgb}, 0.5)`
                    }}>
                      {m.key === 'free' ? (
                        '₹0'
                      ) : inView ? (
                        <CountUp end={m.value} duration={2.5} decimals={m.value % 1 !== 0 ? 1 : 0} suffix={m.suffix} />
                      ) : (
                        `0${m.suffix}`
                      )}
                    </div>
                    <div className="kin-oval-line" style={{ background: m.accent }} />
                  </div>

                  {/* Bottom Third: Text */}
                  <div className="kin-oval-bottom">
                    <h3 className="kin-oval-title">{m.label}</h3>
                    <p className="kin-oval-desc">{m.desc}</p>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
