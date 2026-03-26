// @ts-nocheck
'use client';

import { useRef, useEffect, useCallback } from 'react';

/* ─────────────────────────────────────────────────
   STORY FRAMES  — crossfade images mapped to scroll
   ───────────────────────────────────────────────── */
const FRAMES = [
  { src: '/story/frame1.png', title: 'Voice-First UPI', caption: '"प्रिया को ₹400 भेजो"', sub: 'No typing. No menus. Just speak in your language — done in 4 seconds.' },
  { src: '/story/frame2.png', title: 'Smart Medication', caption: 'Never miss a dose',      sub: 'Scan any prescription. AI sets voice reminders automatically in her language.' },
  { src: '/story/frame3.png', title: 'SOS Emergency',   caption: 'Help in 3 seconds',       sub: 'Triple-tap, shake, or say "bachao." Instant GPS alerts to every family member.' },
  { src: '/story/frame4.png', title: 'Always Connected', caption: 'Family dashboard',       sub: 'Every payment, dose, and SOS — live on your caregiver dashboard.' },
];

/* progress zones: 0–1 */
const ZONES = [
  [0.00, 0.18], // frame 0 pure
  [0.18, 0.30], // 0→1 crossfade
  [0.30, 0.46], // frame 1 pure
  [0.46, 0.58], // 1→2 crossfade
  [0.58, 0.74], // frame 2 pure
  [0.74, 0.86], // 2→3 crossfade
  [0.86, 1.00], // frame 3 pure
];

/* ── helpers ── */
const clmp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const norm  = (v: number, a: number, b: number) => clmp((v - a) / (b - a));

/* Get blend info: { imgA, imgB, alpha (0=A, 1=B) } */
function blend(p: number) {
  if (p < ZONES[0][1]) return { a: 0, b: 0, alpha: 0 };
  if (p < ZONES[1][1]) return { a: 0, b: 1, alpha: norm(p, ZONES[1][0], ZONES[1][1]) };
  if (p < ZONES[2][1]) return { a: 1, b: 1, alpha: 0 };
  if (p < ZONES[3][1]) return { a: 1, b: 2, alpha: norm(p, ZONES[3][0], ZONES[3][1]) };
  if (p < ZONES[4][1]) return { a: 2, b: 2, alpha: 0 };
  if (p < ZONES[5][1]) return { a: 2, b: 3, alpha: norm(p, ZONES[5][0], ZONES[5][1]) };
  return { a: 3, b: 3, alpha: 0 };
}

/* Caption visibility per frame */
function captionProgress(p: number) {
  const idx = p < 0.24  ? 0
            : p < 0.52  ? 1
            : p < 0.80  ? 2
            :              3;
  const zones = [[0,0.24],[0.24,0.52],[0.52,0.80],[0.80,1.00]];
  const [lo, hi] = zones[idx];
  const inner = (hi - lo) * 0.12; // fade margin
  const localP = norm(p, lo, hi);
  const opacity = localP < 0.12 ? norm(p, lo, lo + inner)
                : localP > 0.88 ? 1 - norm(p, hi - inner, hi)
                : 1;
  return { idx, opacity: clmp(opacity) };
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export function StoryScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const imgsRef      = useRef<HTMLImageElement[]>([]);
  const rafRef       = useRef<number>(0);

  /* Caption refs — updated without re-rendering */
  const titleRef   = useRef<HTMLParagraphElement>(null);
  const captionRef = useRef<HTMLHeadingElement>(null);
  const subRef     = useRef<HTMLParagraphElement>(null);
  const progressRef= useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  /* Preload all images once on mount */
  useEffect(() => {
    imgsRef.current = FRAMES.map((f) => {
      const img = new Image();
      img.src = f.src;
      return img;
    });
  }, []);

  /* Main draw loop (rAF) */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // CSS pixel dimensions of the canvas element (not the buffer)
    const W = canvas.offsetWidth  || canvas.parentElement?.offsetWidth  || 800;
    const H = canvas.offsetHeight || canvas.parentElement?.offsetHeight || 500;

    const rect   = container.getBoundingClientRect();
    const totalH = container.offsetHeight - window.innerHeight;
    const scrolled = Math.max(0, Math.min(-rect.top, totalH));
    const p = totalH > 0 ? scrolled / totalH : 0;

    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Reset DPR transform before drawing
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const { a, b, alpha } = blend(p);
    const imgA = imgsRef.current[a];
    const imgB = imgsRef.current[b];

    /* Draw frame A */
    if (imgA?.naturalWidth) {
      ctx.globalAlpha = 1;
      drawCover(ctx, imgA, W, H);
    }

    /* Blend frame B on top */
    if (alpha > 0 && imgB?.naturalWidth && b !== a) {
      ctx.globalAlpha = alpha;
      drawCover(ctx, imgB, W, H);
    }
    ctx.globalAlpha = 1;

    /* Dark cinematic vignette overlay */
    const vg = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, H*0.85);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.72)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);

    /* Bottom caption gradient */
    const capGrad = ctx.createLinearGradient(0, H * 0.65, 0, H);
    capGrad.addColorStop(0, 'rgba(0,0,0,0)');
    capGrad.addColorStop(1, 'rgba(0,0,0,0.88)');
    ctx.fillStyle = capGrad;
    ctx.fillRect(0, 0, W, H);

    /* Update DOM captions without setState */
    const { idx, opacity: capOp } = captionProgress(p);
    const frame = FRAMES[idx];
    if (titleRef.current)   { titleRef.current.textContent   = frame.title;   titleRef.current.style.opacity   = String(capOp); }
    if (captionRef.current) { captionRef.current.textContent = frame.caption;  captionRef.current.style.opacity = String(capOp); }
    if (subRef.current)     { subRef.current.textContent     = frame.sub;      subRef.current.style.opacity     = String(capOp); }
    if (overlayRef.current) { overlayRef.current.style.opacity = String(capOp); }
    if (progressRef.current){ progressRef.current.style.width = `${p * 100}%`; }

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  /* Resize canvas to match its container (the Mac window body, not full viewport) */
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      const W = Math.round(parent.offsetWidth  * dpr);
      const H = Math.round(parent.offsetHeight * dpr);
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width  = W;
        canvas.height = H;
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div
      ref={containerRef}
      id="story-scroll"
      style={{ height: '400vh', position: 'relative' }}
    >
      {/* ── Sticky full-viewport viewport ── */}
      <div style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        /* Transparent — lets the site's own gradient background show through */
        background: 'rgba(var(--bg-primary-rgb, 6,6,15), 0.25)',
        backdropFilter: 'blur(32px) brightness(0.85)',
        WebkitBackdropFilter: 'blur(32px) brightness(0.85)',
        willChange: 'transform',
      }}>

        {/* ── Glassmorphic Mac Window ── */}
        <div style={{
          width: 'min(76vw, 1120px)',
          height: 'min(73vh, 720px)',
          position: 'relative',
          borderRadius: 16,
          overflow: 'hidden',
          /* Multi-layered shadow for depth */
          boxShadow:
            '0 0 0 1px rgba(var(--sah-accent-2-rgb, 59,40,204), 0.25),' +
            '0 0 0 2px rgba(255,255,255,0.04),' +
            '0 30px 80px rgba(0,0,0,0.8),' +
            '0 8px 24px rgba(var(--sah-accent-1-rgb, 255,153,51), 0.08)',
          backdropFilter: 'blur(1px)',
        }}>
          {/* Glassmorphic Title bar */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: 42,
            background: 'rgba(var(--sah-accent-2-rgb, 14,14,36), 0.55)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: 8,
            zIndex: 10,
            borderBottom: '1px solid rgba(var(--sah-accent-2-rgb, 59,40,204), 0.2)',
            borderRadius: '16px 16px 0 0',
          }}>
            {/* Traffic lights with premium glow */}
            {[
              { color: '#FF5F57', glow: 'rgba(255,95,87,0.6)'  },
              { color: '#FEBC2E', glow: 'rgba(254,188,46,0.6)' },
              { color: '#28C840', glow: 'rgba(40,200,64,0.6)'  },
            ].map((dot, i) => (
              <div key={i} style={{
                width: 12, height: 12, borderRadius: '50%',
                background: dot.color,
                boxShadow: `0 0 0 1px rgba(0,0,0,0.2), 0 0 10px ${dot.glow}, 0 0 20px ${dot.glow}`,
                flexShrink: 0,
              }} />
            ))}
            {/* Spacer + URL bar */}
            <div style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 16px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: 11.5,
                color: 'rgba(255,255,255,0.5)',
                fontFamily: 'var(--font-body, system-ui)',
                letterSpacing: '0.02em',
                userSelect: 'none',
                maxWidth: 360,
              }}>
                {/* Lock icon */}
                <svg width="10" height="11" viewBox="0 0 10 11" fill="none">
                  <rect x="1.5" y="4.5" width="7" height="6" rx="1" stroke="rgba(255,153,51,0.7)" strokeWidth="1.2"/>
                  <path d="M3 4.5V3a2 2 0 0 1 4 0v1.5" stroke="rgba(255,153,51,0.7)" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <span style={{ color: 'rgba(255,153,51,0.85)', fontWeight: 600 }}>sahayak.app</span>
                <span>/live-demo</span>
              </div>
            </div>
            {/* Right side — three dots */}
            <div style={{ display: 'flex', gap: 4 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />)}
            </div>
          </div>

          {/* Canvas — fills below title bar */}
          <canvas
            ref={canvasRef}
            style={{
              display: 'block',
              width: '100%',
              height: 'calc(100% - 42px)',
              marginTop: 42,
              willChange: 'transform',
            }}
          />

          {/* Caption overlay (inside window, bottom) */}
          <div ref={overlayRef} style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            padding: '32px 40px 36px',
            pointerEvents: 'none',
            transition: 'opacity 0.4s ease',
          }}>
            <p ref={titleRef} style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#FF9933',
              fontFamily: 'var(--font-accent, system-ui)',
              margin: '0 0 8px 0',
              transition: 'opacity 0.4s ease',
            }} />
            <h3 ref={captionRef} style={{
              fontSize: 'clamp(22px, 3vw, 38px)',
              fontWeight: 800,
              color: '#ffffff',
              fontFamily: 'var(--font-display, system-ui)',
              lineHeight: 1.15,
              margin: '0 0 10px 0',
              textShadow: '0 2px 20px rgba(0,0,0,0.8)',
              transition: 'opacity 0.4s ease',
            }} />
            <p ref={subRef} style={{
              fontSize: 'clamp(13px, 1.3vw, 15px)',
              color: 'rgba(255,255,255,0.7)',
              fontFamily: 'var(--font-body, system-ui)',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: 520,
              transition: 'opacity 0.4s ease',
            }} />
          </div>
        </div>

        {/* ── Saffron progress bar (bottom of viewport) ── */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: 3,
          background: 'rgba(255,153,51,0.15)',
        }}>
          <div ref={progressRef} style={{
            height: '100%',
            width: '0%',
            background: 'linear-gradient(90deg, #FF9933, #FFD700)',
            boxShadow: '0 0 12px #FF993388',
            transition: 'none', // instant — no lag
            borderRadius: '0 3px 3px 0',
          }} />
        </div>

        {/* ── Scroll hint (fades out early) ── */}
        <div style={{
          position: 'absolute',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          pointerEvents: 'none',
          animation: 'pulseDown 2s ease-in-out infinite',
        }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', fontFamily: 'system-ui' }}>SCROLL</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.3 }}>
            <path d="M8 3v10M3 8l5 5 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ── Cover-fit draw helper ── */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, W: number, H: number) {
  const iAspect = img.naturalWidth / img.naturalHeight;
  const cAspect = W / H;
  let sw, sh, sx, sy;
  if (iAspect > cAspect) {
    sh = img.naturalHeight;
    sw = sh * cAspect;
    sx = (img.naturalWidth - sw) / 2;
    sy = 0;
  } else {
    sw = img.naturalWidth;
    sh = sw / cAspect;
    sx = 0;
    sy = (img.naturalHeight - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
}
