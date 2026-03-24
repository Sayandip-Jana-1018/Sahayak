// @ts-nocheck
'use client';

/**
 * MacBookStory — pure scroll spacer + caption overlay.
 * The 3D MacBook is rendered by MacBookScene (position:fixed).
 * This component provides the scroll height (500vh) and animates captions.
 */

import { useRef, useEffect } from 'react';

const CAPTIONS = [
  { label: 'THE PROBLEM',   heading: 'She owns a smartphone',        sub: '— she just cannot use it.' },
  { label: 'THE REALITY',   heading: 'No one could teach her.',      sub: 'A Rs 5,000 phone. Unopened.' },
  { label: 'THE SOLUTION',  heading: 'Bolo, ho jaayega.',            sub: 'Just speak. It\'s done.' },
  { label: 'INTRODUCING',   heading: 'Sahayak.',                     sub: 'India\'s first voice-first AI for elders.' },
];

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const norm  = (v: number, lo: number, hi: number) => clamp((v - lo) / (hi - lo), 0, 1);

export function MacBookStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef  = useRef<HTMLDivElement>(null);
  const captionBoxRef = useRef<HTMLDivElement>(null);
  const labelRef     = useRef<HTMLSpanElement>(null);
  const headingRef   = useRef<HTMLHeadingElement>(null);
  const subRef       = useRef<HTMLParagraphElement>(null);
  const rafRef       = useRef(0);

  useEffect(() => {
    let lastIdx = -1;

    const tick = () => {
      const el = containerRef.current;
      if (!el) { rafRef.current = requestAnimationFrame(tick); return; }

      const rect  = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const p     = total > 0 ? clamp(-rect.top / total, 0, 1) : 0;

      // Progress bar
      if (progressRef.current) progressRef.current.style.width = `${p * 100}%`;

      // Show captions between 20%–85%
      const visible = p >= 0.18 && p < 0.86;
      if (captionBoxRef.current) {
        captionBoxRef.current.style.opacity = visible ? '1' : '0';
      }

      if (visible) {
        const storyP = norm(p, 0.22, 0.82);
        const idx    = Math.min(Math.floor(storyP * 4), 3);
        const segP   = (storyP * 4) % 1;
        const segOp  = segP < 0.12 ? segP / 0.12 : segP > 0.88 ? (1 - segP) / 0.12 : 1;

        if (idx !== lastIdx) {
          lastIdx = idx;
          const cap = CAPTIONS[idx];
          if (labelRef.current)   labelRef.current.textContent   = cap.label;
          if (headingRef.current) headingRef.current.textContent  = cap.heading;
          if (subRef.current)     subRef.current.textContent      = cap.sub;
        }
        if (captionBoxRef.current) captionBoxRef.current.style.opacity = String(clamp(segOp, 0, 1));
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div
      ref={containerRef}
      id="macbook-story"
      style={{ height: '350vh', position: 'relative' }}
    >
      {/* ─── ISOLATED BACKGROUND LAYER FOR RIPPLES (Fixes Canvas Overlap) ─── */}
      <div style={{ position: 'sticky', top: 0, height: '100svh', zIndex: -10, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '55%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100vw', height: 400,
          perspective: 1000,
        }}>
          <style>{`
            @keyframes mac-ripple-expand {
              0% { transform: translate(-50%, -50%) rotateX(75deg) scale(0.2); opacity: 0.6; border-width: 4px; }
              100% { transform: translate(-50%, -50%) rotateX(75deg) scale(4); opacity: 0; border-width: 1px; }
            }
            .mac-ripple-circle {
              position: absolute; top: 50%; left: 50%;
              border-radius: 50%;
              border-style: solid;
              border-color: var(--sah-accent-1);
              animation: mac-ripple-expand 6s cubic-bezier(0.1, 0.4, 0.3, 1) infinite;
            }
          `}</style>
          <div className="mac-ripple-circle" style={{ width: 400, height: 400, animationDelay: '0s' }} />
          <div className="mac-ripple-circle" style={{ width: 400, height: 400, animationDelay: '1.2s' }} />
          <div className="mac-ripple-circle" style={{ width: 400, height: 400, animationDelay: '2.4s' }} />
          <div className="mac-ripple-circle" style={{ width: 400, height: 400, animationDelay: '3.6s' }} />
          <div className="mac-ripple-circle" style={{ width: 400, height: 400, animationDelay: '4.8s' }} />
        </div>
      </div>

      {/* Sticky overlay — only shows captions + progress bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        height: '100svh',
        pointerEvents: 'none',
        zIndex: 15,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}>

        {/* Caption block */}
        <div
          ref={captionBoxRef}
          style={{
            textAlign: 'center',
            transition: 'opacity 0.35s ease',
            opacity: 0,
            maxWidth: 600,
            padding: '0 24px',
          }}
        >
          <span ref={labelRef} style={{
            display: 'block',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#FF9933',
            fontFamily: 'var(--font-accent, Syne, system-ui)',
            marginBottom: 10,
          }} />
          <h3 ref={headingRef} style={{
            fontSize: 'clamp(28px, 3.5vw, 46px)',
            fontWeight: 800,
            fontFamily: 'var(--font-display, Fraunces, Georgia, serif)',
            color: '#fff',
            lineHeight: 1.12,
            margin: '0 0 10px',
            textShadow: '0 2px 30px rgba(0,0,0,0.9)',
            letterSpacing: '-0.02em',
          }} />
          <p ref={subRef} style={{
            fontSize: 'clamp(14px, 1.3vw, 17px)',
            color: 'rgba(255,255,255,0.6)',
            fontFamily: 'var(--font-body, DM Sans, system-ui)',
            lineHeight: 1.65,
            margin: 0,
          }} />
        </div>

        {/* Scroll hint */}
        <div style={{
          marginTop: 24,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
          opacity: 0.35,
        }}>
          <span style={{ fontSize: 9, letterSpacing: '0.16em', color: '#fff', fontFamily: 'var(--font-accent, Syne, system-ui)' }}>SCROLL</span>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8l5 5 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Saffron progress bar */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: 3,
          background: 'rgba(255,153,51,0.12)',
        }}>
          <div ref={progressRef} style={{
            height: '100%',
            width: '0%',
            background: 'linear-gradient(90deg, #FF9933, #FFD700)',
            boxShadow: '0 0 10px rgba(255,153,51,0.4)',
            borderRadius: '0 3px 3px 0',
          }} />
        </div>
      </div>
    </div>
  );
}
