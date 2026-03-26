'use client';

import React, { useRef, useEffect, useState, CSSProperties } from 'react';
import { useLocaleStore } from '@/store/localeStore';
import { Smartphone, Mic, LayoutDashboard, ChevronRight } from 'lucide-react';

const STEPS = [
  { 
    step: 1, num: '01', titleKey: 'how.step1.title', descKey: 'how.step1.desc', 
    Icon: Smartphone, accent: '#FF8C45', rgb: '255,140,69',
    delayBase: 150
  },
  { 
    step: 2, num: '02', titleKey: 'how.step2.title', descKey: 'how.step2.desc', 
    Icon: Mic, accent: '#F0B429', rgb: '240,180,41',
    delayBase: 400,
  },
  { 
    step: 3, num: '03', titleKey: 'how.step3.title', descKey: 'how.step3.desc', 
    Icon: LayoutDashboard, accent: '#FFF6EC', rgb: '255,246,236',
    delayBase: 600
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const t = useLocaleStore((s) => s.t);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const rv = `hiw-reveal ${inView ? 'hiw-reveal--on' : ''}`;
  const dl = (d: number): CSSProperties => ({ transitionDelay: `${d}ms` });
  const cardStyle = (s: typeof STEPS[0]): CSSProperties => ({
    '--hiw-accent': s.accent,
    '--hiw-rgb': s.rgb,
    ...dl(s.delayBase),
  } as CSSProperties);

  const Step1Icon = STEPS[0].Icon;
  const Step2Icon = STEPS[1].Icon;
  const Step3Icon = STEPS[2].Icon;

  return (
    <section ref={sectionRef} id="how-it-works"
      style={{
        position: 'relative',
        padding: 'clamp(80px, 10vw, 160px) 24px',
        background: 'transparent',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', background: 'transparent' }}>
        
        {/* ── Section Header ── */}
        <div className={`hiw-header ${rv}`} style={dl(0)}>
          <span className="hiw-pill-badge">
            <span className="hiw-pulse-dot" />
            HOW IT WORKS
          </span>
          <h2 className="hiw-heading">
            Simple as <span className="hiw-heading-accent">1-2-3</span>
          </h2>
          <p className="hiw-subtitle">
            Three steps. Any language. Any phone.
          </p>
        </div>

        {/* ── Timeline Grid ── */}
        <div className="hiw-timeline">
          
          {/* Step 1 */}
          <div className={`hiw-card ${rv}`} style={cardStyle(STEPS[0])}>
            <div className="hiw-card-shimmer" />
            <div className="hiw-watermark">{STEPS[0].num}</div>
            
            <div className="hiw-step-badge" style={{ borderColor: `rgba(${STEPS[0].rgb}, 0.35)`, color: STEPS[0].accent }}>
              {STEPS[0].num}
            </div>
            
            <div className="hiw-icon-box" style={{ background: `rgba(${STEPS[0].rgb}, 0.15)`, border: `1px solid rgba(${STEPS[0].rgb}, 0.35)` }}>
              <Step1Icon size={22} style={{ color: STEPS[0].accent }} />
            </div>
            
            <h3 className="hiw-card-title" style={{ color: '#FFFFFF' }}>{t(STEPS[0].titleKey)}</h3>
            <p className="hiw-card-desc">{t(STEPS[0].descKey)}</p>
          </div>

          {/* Connector 1 */}
          <div className={`hiw-connector ${rv}`} style={dl(300)}>
            <div className="hiw-conn-line">
              <div className="hiw-conn-dot" />
              <ChevronRight className="hiw-conn-chevron" size={16} />
            </div>
          </div>

          {/* Step 2 */}
          <div className={`hiw-card ${rv}`} style={cardStyle(STEPS[1])}>
            <div className="hiw-card-shimmer" />
            <div className="hiw-watermark">{STEPS[1].num}</div>
            
            <div className="hiw-step-badge" style={{ borderColor: `rgba(${STEPS[1].rgb}, 0.35)`, color: STEPS[1].accent }}>
              {STEPS[1].num}
            </div>
            
            <div className="hiw-icon-box" style={{ background: `rgba(${STEPS[1].rgb}, 0.15)`, border: `1px solid rgba(${STEPS[1].rgb}, 0.35)` }}>
              <Step2Icon size={22} style={{ color: STEPS[1].accent }} />
            </div>
            
            <h3 className="hiw-card-title" style={{ color: '#FFFFFF' }}>{t(STEPS[1].titleKey)}</h3>
            <div className="hiw-card-desc hiw-quote-card">
              &quot;मुझे दर्द हो रहा है, क्या करूँ?&quot;
            </div>
            <p className="hiw-card-desc" style={{ marginTop: 8 }}>{t(STEPS[1].descKey)}</p>
          </div>

          {/* Connector 2 */}
          <div className={`hiw-connector ${rv}`} style={dl(500)}>
            <div className="hiw-conn-line">
              <div className="hiw-conn-dot" />
              <ChevronRight className="hiw-conn-chevron" size={16} />
            </div>
          </div>

          {/* Step 3 */}
          <div className={`hiw-card ${rv}`} style={cardStyle(STEPS[2])}>
            <div className="hiw-card-shimmer" />
            <div className="hiw-watermark">{STEPS[2].num}</div>
            
            <div className="hiw-step-badge" style={{ borderColor: `rgba(${STEPS[2].rgb}, 0.35)`, color: STEPS[2].accent }}>
              {STEPS[2].num}
            </div>
            
            <div className="hiw-icon-box" style={{ background: `rgba(${STEPS[2].rgb}, 0.15)`, border: `1px solid rgba(${STEPS[2].rgb}, 0.35)` }}>
              <Step3Icon size={22} style={{ color: STEPS[2].accent }} />
            </div>
            
            <h3 className="hiw-card-title" style={{ color: '#FFFFFF' }}>{t(STEPS[2].titleKey)}</h3>
            <p className="hiw-card-desc">{t(STEPS[2].descKey)}</p>
          </div>
        </div>

        {/* ── Progress Indicator ── */}
        <div className={`hiw-progress-wrap ${rv}`} style={dl(800)}>
          <div className="hiw-progress-track">
            <div className="hiw-progress-fill" />
          </div>
        </div>

      </div>
    </section>
  );
}
