'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function CustomCursor() {
  // Inner dot follows mouse directly (no lag)
  const dotX = useMotionValue(0);
  const dotY = useMotionValue(0);
  // Outer ring uses spring (slight elegant lag)
  const ringX = useSpring(dotX, { damping: 30, stiffness: 400 });
  const ringY = useSpring(dotY, { damping: 30, stiffness: 400 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsTouch('ontouchstart' in window);
    if ('ontouchstart' in window) return;

    const move = (e: MouseEvent) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      setIsVisible(true);
    };
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('a, button, [role="button"], input, textarea, select, [data-clickable]')) setIsHovering(true);
    };
    const out = () => setIsHovering(false);
    const leave = () => setIsVisible(false);
    const enter = () => setIsVisible(true);

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseover', over);
    document.addEventListener('mouseout', out);
    document.addEventListener('mouseleave', leave);
    document.addEventListener('mouseenter', enter);

    return () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', over);
      document.removeEventListener('mouseout', out);
      document.removeEventListener('mouseleave', leave);
      document.removeEventListener('mouseenter', enter);
    };
  }, [dotX, dotY]);

  if (isTouch) return null;

  return (
    <>
      {/* Inner dot — follows mouse EXACTLY (no spring lag) */}
      <motion.div
        className="custom-cursor"
        style={{
          position: 'fixed', top: 0, left: 0,
          x: dotX, y: dotY,
          width: isHovering ? 6 : 6,
          height: isHovering ? 6 : 6,
          borderRadius: '50%',
          background: 'var(--sah-accent-1)',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: isVisible ? 1 : 0,
          transform: 'translate(-50%, -50%)',
          transition: 'opacity 0.3s',
          mixBlendMode: 'difference',
        }}
      />
      {/* Outer ring — slight spring lag for elegance */}
      <motion.div
        className="custom-cursor"
        style={{
          position: 'fixed', top: 0, left: 0,
          x: ringX, y: ringY,
          width: isHovering ? 44 : 24,
          height: isHovering ? 44 : 24,
          borderRadius: '50%',
          border: `1px solid rgba(var(--sah-accent-1-rgb), ${isHovering ? 0.5 : 0.2})`,
          background: isHovering ? 'rgba(var(--sah-accent-1-rgb), 0.06)' : 'transparent',
          pointerEvents: 'none',
          zIndex: 9998,
          opacity: isVisible ? 0.8 : 0,
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.25s, height 0.25s, opacity 0.3s, background 0.2s',
        }}
      />
    </>
  );
}
