'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const TESTIMONIALS = [
  {
    name: 'Rajesh Kumar',
    relation: 'Son of Kamla Devi, 72',
    location: 'Mumbai',
    quote: 'My mother lives alone in Varanasi. With Sahayak, she takes her medicines on time and I get instant alerts if anything goes wrong. It\'s like having someone with her 24/7.',
    avatar: '👨',
    rating: 5,
  },
  {
    name: 'Dr. Priya Sharma',
    relation: 'NGO Director, HelpAge India',
    location: 'Delhi',
    quote: 'We deployed Sahayak across 50 old age homes. The voice-first approach eliminated the digital literacy barrier. Our residents actually ENJOY using their phones now.',
    avatar: '👩‍⚕️',
    rating: 5,
  },
  {
    name: 'Suresh Patel',
    relation: 'CSC Operator',
    location: 'Gujarat',
    quote: 'The scheme finder alone has helped 200+ seniors in my village discover pension benefits they didn\'t know about. Government schemes explained in simple Gujarati!',
    avatar: '👨‍💼',
    rating: 5,
  },
  {
    name: 'Meena Iyer',
    relation: 'Daughter of Lakshmi, 68',
    location: 'Chennai',
    quote: 'Amma was confused by every app. With Sahayak, she just talks to her phone in Tamil and it does everything — from calling me to ordering groceries.',
    avatar: '👩',
    rating: 5,
  },
];

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <section ref={sectionRef} id="testimonials" style={{ padding: 'clamp(80px, 10vw, 160px) 0', overflow: 'hidden' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 48, padding: '0 24px' }}>
        <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 9999, background: 'rgba(236,72,153,0.1)', color: '#ec4899', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
          Testimonials
        </span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, lineHeight: 1.2 }}>
          Loved by <span style={{ color: 'var(--sah-accent-1)' }}>Families</span>
        </h2>
      </motion.div>

      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        style={{
          display: 'flex',
          gap: 20,
          overflowX: 'auto',
          padding: '0 24px 20px',
          cursor: isDragging ? 'grabbing' : 'grab',
          scrollbarWidth: 'none',
          scrollBehavior: 'smooth',
        }}
      >
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
            className="glass-card"
            style={{
              flexShrink: 0,
              width: 340,
              padding: 28,
              borderRadius: 20,
              userSelect: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 40 }}>{t.avatar}</span>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</h4>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.relation}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.location}</p>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              {'⭐'.repeat(t.rating)}
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              &ldquo;{t.quote}&rdquo;
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
