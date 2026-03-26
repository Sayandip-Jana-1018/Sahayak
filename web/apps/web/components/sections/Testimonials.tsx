'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => setCurrentIndex((prev) => prev + 1);
  const handlePrev = () => setCurrentIndex((prev) => prev - 1);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Helper to map an infinite index to our 4 cards
  const getCardStyle = (index: number) => {
    // Current logical center in the infinite sequence
    const center = currentIndex;
    
    // The card's innate index is `index`. We want to find its offset from `center`.
    // Since there are 4 cards, we want to find the shortest path in modulo 4 arithmetic.
    let diff = (index - center) % 4;
    // Fix negative modulo in JS
    if (diff < 0) diff += 4; 
    
    // Map to -1, 0, 1, 2
    if (diff === 3) diff = -1;

    // diff is now the shortest distance: 0 (center), 1 (right), -1 (left), 2 (outer/back)
    
    // Base values
    let translateX = 0;
    let rotateY = 0;
    let scale = 1;
    let opacity = 1;
    let zIndex = 10;

    if (diff === 0) {
      // Center
      translateX = 0;
      rotateY = 0;
      scale = 1;
      opacity = 1;
      zIndex = 10;
    } else if (diff === 1) {
      // Right adjacent
      translateX = 280; // pixels
      rotateY = -20; // lean away
      scale = 0.85;
      opacity = 0.75;
      zIndex = 5;
    } else if (diff === -1) {
      // Left adjacent
      translateX = -280;
      rotateY = 20;
      scale = 0.85;
      opacity = 0.75;
      zIndex = 5;
    } else {
      // Outer (Back)
      translateX = 0;
      rotateY = 0;
      scale = 0.7;
      opacity = 0; // Hide completely or fade out neatly
      zIndex = 1;
    }

    return {
      transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
      opacity,
      zIndex,
      transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    };
  };

  return (
    <section ref={sectionRef} id="testimonials" style={{ padding: 'clamp(80px, 10vw, 160px) 0', overflow: 'hidden' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 64, padding: '0 24px' }}>
        <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 9999, background: 'rgba(236,72,153,0.1)', color: '#ec4899', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
          Testimonials
        </span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.2 }}>
          Loved by <span style={{ color: 'var(--sah-accent-1)' }}>Families</span>
        </h2>
      </motion.div>

      <div style={{ position: 'relative', width: '100%', maxWidth: 1000, margin: '0 auto', height: 400 }}>
        
        {/* Controls */}
        <button onClick={handlePrev} className="kin-carousel-btn kin-carousel-prev" aria-label="Previous Testimonial">
          <ChevronLeft size={24} />
        </button>
        <button onClick={handleNext} className="kin-carousel-btn kin-carousel-next" aria-label="Next Testimonial">
          <ChevronRight size={24} />
        </button>

        {/* 3D Container for Cards */}
        <div style={{ position: 'absolute', inset: 0, perspective: 1000, transformStyle: 'preserve-3d', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {TESTIMONIALS.map((t, i) => {
            const styleKeys = getCardStyle(i);
            return (
              <div
                key={t.name}
                className="glass-card kin-testimonial-card"
                style={{
                  position: 'absolute',
                  width: 360,
                  padding: '32px 28px',
                  borderRadius: 20,
                  userSelect: 'none',
                  ...styleKeys
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <span style={{ fontSize: 48 }}>{t.avatar}</span>
                  <div style={{ textAlign: 'left' }}>
                    <h4 style={{ fontWeight: 700, fontSize: 16, color: 'white', marginBottom: 2 }}>{t.name}</h4>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.relation}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.location}</p>
                  </div>
                </div>
                
                <div style={{ marginBottom: 16, textAlign: 'left' }}>
                  <span style={{ fontSize: 14 }}>{'⭐'.repeat(t.rating)}</span>
                </div>
                
                <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)', textAlign: 'left' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
