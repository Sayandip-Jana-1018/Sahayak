'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';

const TOTAL_FRAMES = 56;
const FRAME_PATH = (i: number) => `/frames/frame${String(i).padStart(4, '0')}.jpg`;

const CAPTIONS = [
  { start: 0, end: 0.18, title: 'Voice-First UPI', sub: '"प्रिया को ₹400 भेजो"', desc: 'No typing. No menus. Just speak naturally in your language — transaction done in 4 seconds.' },
  { start: 0.25, end: 0.45, title: 'Smart Medication', sub: 'Never miss a dose', desc: 'Scan any prescription. AI reads it and sets voice reminders in their language automatically.' },
  { start: 0.50, end: 0.70, title: 'SOS Emergency', sub: 'Help in 3 seconds', desc: 'Triple-tap, shake, or say "bachao." Instant GPS-tagged alerts reach every family member.' },
  { start: 0.75, end: 0.95, title: 'Always Connected', sub: 'Family dashboard', desc: 'Every payment, medication, and SOS — visible on your always-on caregiver dashboard.' },
];

export function StoryScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [currentCaption, setCurrentCaption] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, TOTAL_FRAMES - 1]);
  // Phone rotates and zooms as frames play
  const phoneRotate = useTransform(scrollYProgress, [0, 0.3, 0.5, 0.8, 1], [8, 0, -5, 0, 6]);
  const phoneScale = useTransform(scrollYProgress, [0, 0.2, 0.5, 0.8, 1], [0.85, 1.05, 1.0, 1.05, 0.9]);

  useMotionValueEvent(scrollYProgress, 'change', (val) => {
    for (let i = CAPTIONS.length - 1; i >= 0; i--) {
      if (val >= CAPTIONS[i].start) { setCurrentCaption(i); break; }
    }
  });

  // Preload frames
  useEffect(() => {
    let loaded = 0;
    const images: HTMLImageElement[] = [];
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);
      img.onload = () => { loaded++; if (loaded >= TOTAL_FRAMES * 0.8) setImagesLoaded(true); };
      img.onerror = () => { loaded++; if (loaded >= TOTAL_FRAMES * 0.8) setImagesLoaded(true); };
      images.push(img);
    }
    imagesRef.current = images;
  }, []);

  const renderFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const idx = Math.round(Math.max(0, Math.min(TOTAL_FRAMES - 1, index)));
    const img = imagesRef.current[idx];
    if (!img?.complete) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  }, []);

  useMotionValueEvent(frameIndex, 'change', renderFrame);
  useEffect(() => { if (imagesLoaded) renderFrame(0); }, [imagesLoaded, renderFrame]);

  return (
    <div ref={containerRef} style={{ height: '350vh', position: 'relative' }}>
      {/* Sticky viewport */}
      <div style={{
        position: 'sticky', top: 0, height: '100vh',
        display: 'flex', alignItems: 'center',
        overflow: 'hidden',
        padding: '0 clamp(24px, 5vw, 80px)',
      }}>
        {/* Two-column layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 40,
          width: '100%',
          maxWidth: 1200,
          margin: '0 auto',
          alignItems: 'center',
        }}>
          {/* Left: Captions */}
          <div style={{ position: 'relative', minHeight: 260 }}>
            {CAPTIONS.map((cap, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  opacity: currentCaption === i ? 1 : 0,
                  y: currentCaption === i ? 0 : 40,
                  filter: currentCaption === i ? 'blur(0px)' : 'blur(6px)',
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                  position: i === 0 ? 'relative' : 'absolute',
                  top: 0, left: 0, right: 0,
                  pointerEvents: currentCaption === i ? 'auto' : 'none',
                }}
              >
                <span style={{
                  display: 'inline-block', padding: '4px 12px', borderRadius: 9999,
                  background: 'rgba(var(--sah-accent-1-rgb), 0.1)',
                  border: '1px solid rgba(var(--sah-accent-1-rgb), 0.2)',
                  color: 'var(--sah-accent-1)', fontSize: 11, fontWeight: 600,
                  fontFamily: 'var(--font-accent)', letterSpacing: '0.08em',
                  textTransform: 'uppercase', marginBottom: 16,
                }}>
                  {cap.title}
                </span>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(28px, 3.5vw, 48px)',
                  fontWeight: 800, lineHeight: 1.1,
                  color: 'var(--text-primary)', marginTop: 12,
                }}>
                  {cap.sub}
                </h2>
                <p style={{
                  fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)',
                  marginTop: 16, fontFamily: 'var(--font-body)', maxWidth: 380,
                }}>
                  {cap.desc}
                </p>

                {/* Step indicator */}
                <div style={{
                  display: 'flex', gap: 6, marginTop: 28,
                }}>
                  {CAPTIONS.map((_, j) => (
                    <div key={j} style={{
                      width: currentCaption === j ? 32 : 8, height: 4,
                      borderRadius: 4,
                      background: currentCaption === j ? 'var(--sah-accent-1)' : 'rgba(255,255,255,0.12)',
                      transition: 'all 0.35s ease',
                    }} />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right: Phone frame with canvas */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <motion.div
              style={{
                rotate: phoneRotate,
                scale: phoneScale,
                position: 'relative',
              }}
            >
              {/* Phone bezel */}
              <div style={{
                width: 'clamp(240px, 20vw, 320px)',
                borderRadius: 36,
                background: 'linear-gradient(145deg, #2a2a3e, #0f0f1a, #1a1a2e)',
                padding: 6,
                boxShadow: `
                  0 40px 80px rgba(0,0,0,0.5),
                  0 0 60px rgba(var(--sah-accent-1-rgb), 0.06),
                  0 0 0 1px rgba(255,255,255,0.06),
                  inset 0 1px 0 rgba(255,255,255,0.08)
                `,
              }}>
                {/* Notch */}
                <div style={{
                  position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
                  width: '32%', height: 24, background: '#000',
                  borderRadius: '0 0 14px 14px', zIndex: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#1a1a2e', border: '1px solid #333' }} />
                </div>

                {/* Screen with canvas */}
                <div style={{
                  borderRadius: 30, overflow: 'hidden',
                  background: '#000', position: 'relative',
                  aspectRatio: '9/19.5',
                }}>
                  <canvas
                    ref={canvasRef}
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'cover',
                      opacity: imagesLoaded ? 1 : 0,
                      transition: 'opacity 0.5s',
                    }}
                  />
                  {/* Loading shimmer */}
                  {!imagesLoaded && (
                    <motion.div
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(160deg, var(--sah-accent-2), var(--sah-accent-1))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 13, fontFamily: 'var(--font-body)',
                      }}
                    >
                      Loading...
                    </motion.div>
                  )}

                  {/* Screen glare */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.02) 100%)',
                    pointerEvents: 'none', borderRadius: 30,
                  }} />
                </div>

                {/* Bottom bar */}
                <div style={{
                  position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
                  width: '30%', height: 4, borderRadius: 9999, background: 'rgba(255,255,255,0.2)', zIndex: 10,
                }} />
              </div>

              {/* Accent glow */}
              <div style={{
                position: 'absolute', inset: -40, borderRadius: 60,
                background: `radial-gradient(ellipse at center, rgba(var(--sah-accent-1-rgb), 0.10) 0%, transparent 65%)`,
                zIndex: -1, filter: 'blur(30px)', pointerEvents: 'none',
              }} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
