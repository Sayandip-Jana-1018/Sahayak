'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useThemeStore } from '@/store/themeStore';

export function Phone3D() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTheme = useThemeStore((s) => s.activeTheme);
  const [videoReady, setVideoReady] = useState(false);

  // Mouse tracking for 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(mouseY, { stiffness: 60, damping: 20 });
  const rotateY = useSpring(mouseX, { stiffness: 60, damping: 20 });

  // Force video play with multiple attempts
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const tryPlay = () => {
      vid.muted = true;
      vid.playsInline = true;
      vid.play().then(() => {
        setVideoReady(true);
      }).catch(() => {
        // Retry after a short delay
        setTimeout(() => {
          vid.play().then(() => setVideoReady(true)).catch(() => {});
        }, 500);
      });
    };

    // Try immediately
    tryPlay();

    // Also try on canplay event
    vid.addEventListener('canplay', tryPlay);
    // Fallback: show video after 2s even if play fails
    const fallback = setTimeout(() => setVideoReady(true), 2000);

    return () => {
      vid.removeEventListener('canplay', tryPlay);
      clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseX.set(x * 12);
      mouseY.set(-y * 8);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: 1200,
      }}
    >
      {/* Floating bob animation */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Mouse-reactive tilt */}
        <motion.div
          style={{
            rotateX,
            rotateY,
            position: 'relative',
            width: 'clamp(220px, 18vw, 280px)',
            aspectRatio: '9 / 19.5',
            borderRadius: 40,
            background: 'linear-gradient(145deg, #2a2a3e 0%, #0f0f1a 50%, #1a1a2e 100%)',
            padding: 6,
            boxShadow: `
              0 40px 80px rgba(0, 0, 0, 0.4),
              0 0 60px rgba(${activeTheme.accent1Rgb}, 0.08),
              0 0 0 1px rgba(255, 255, 255, 0.06),
              inset 0 1px 0 rgba(255, 255, 255, 0.08),
              inset 0 -1px 0 rgba(0, 0, 0, 0.3)
            `,
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
          }}
        >
          {/* Notch */}
          <div style={{
            position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
            width: '35%', height: 26,
            background: '#000', borderRadius: '0 0 16px 16px', zIndex: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a1a2e', border: '1.5px solid #333' }} />
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#0a3', opacity: 0.5 }} />
          </div>

          {/* Screen */}
          <div style={{
            width: '100%', height: '100%', borderRadius: 34,
            overflow: 'hidden', position: 'relative', background: '#000',
          }}>
            {/* Video element — always rendered, opacity controlled */}
            <video
              ref={videoRef}
              src="/videos/hero.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                opacity: videoReady ? 1 : 0,
                transition: 'opacity 0.6s ease',
              }}
            />

            {/* Gradient fallback while video loads */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(160deg, ${activeTheme.accent2}, ${activeTheme.accent1})`,
              opacity: videoReady ? 0 : 1,
              transition: 'opacity 0.6s ease',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 8, color: '#fff',
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>सहायक</span>
            </div>

            {/* Screen glare overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.03) 100%)',
              pointerEvents: 'none', borderRadius: 34,
            }} />
          </div>

          {/* Side buttons */}
          <div style={{ position: 'absolute', right: -2, top: '28%', width: 3, height: 36, borderRadius: 2, background: 'linear-gradient(180deg, #3a3a4e, #1a1a2e)' }} />
          <div style={{ position: 'absolute', left: -2, top: '22%', width: 3, height: 20, borderRadius: 2, background: 'linear-gradient(180deg, #3a3a4e, #1a1a2e)' }} />
          <div style={{ position: 'absolute', left: -2, top: '30%', width: 3, height: 36, borderRadius: 2, background: 'linear-gradient(180deg, #3a3a4e, #1a1a2e)' }} />

          {/* Bottom bar */}
          <div style={{
            position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
            width: '35%', height: 4, borderRadius: 9999, background: 'rgba(255,255,255,0.2)', zIndex: 10,
          }} />

          {/* Accent glow */}
          <div style={{
            position: 'absolute', inset: -30, borderRadius: 60,
            background: `radial-gradient(ellipse at center, rgba(${activeTheme.accent1Rgb}, 0.12) 0%, transparent 70%)`,
            zIndex: -1, filter: 'blur(20px)', pointerEvents: 'none',
          }} />
        </motion.div>
      </motion.div>
    </div>
  );
}
