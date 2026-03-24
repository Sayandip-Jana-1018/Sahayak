'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ORG_FEATURES = [
  { color: '#F59E0B', title: 'White-Label Platform', description: 'Add your logo, brand colors, and custom workflows.', icon: '🎨' },
  { color: '#EE4B2B', title: 'Bulk Device Management', description: 'Deploy across 100s of devices from a single dashboard.', icon: '📱' },
  { color: '#10B981', title: 'Custom AI Flows', description: 'Tailor voice commands and responses for your use case.', icon: '🤖' },
  { color: '#F5C842', title: 'Analytics Dashboard', description: 'Track engagement, health metrics, and outcomes at scale.', icon: '📊' },
  { color: '#F97316', title: 'API Access', description: 'Integrate Sahayak with existing EHR and care management systems.', icon: '🔌' },
  { color: '#14B8A6', title: 'Priority Support', description: 'Dedicated account manager and 24/7 technical support.', icon: '🛡️' },
];

export function ForOrganizations() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const idx = Number(entry.target.getAttribute('data-index'));
            setActiveIndex(idx);
          }
        });
      },
      { root, threshold: 0.6 }
    );

    Array.from(root.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, []);

  const scrollToIndex = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const cards = container.children;
    const card = cards[index] as HTMLElement;
    if (card) {
      // Calculate center position
      const scrollLeft = card.offsetLeft - (container.clientWidth / 2) + (card.clientWidth / 2);
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  };

  const handleNext = () => scrollToIndex((activeIndex + 1) % ORG_FEATURES.length);
  const handlePrev = () => scrollToIndex((activeIndex - 1 + ORG_FEATURES.length) % ORG_FEATURES.length);

  // Autoplay and Wheel Scroll Hijack
  useEffect(() => {
    // 1. Autoplay Interval
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const nextIdx = (prev + 1) % ORG_FEATURES.length;
        const container = scrollRef.current;
        if (container) {
          const cards = container.children;
          const card = cards[nextIdx] as HTMLElement;
          if (card) {
            const scrollLeft = card.offsetLeft - (container.clientWidth / 2) + (card.clientWidth / 2);
            container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
          }
        }
        return prev; 
      });
    }, 4500);

    // 2. Wheel Scroll to Horizontal
    const scrollEl = scrollRef.current;
    if (!scrollEl) return () => clearInterval(timer);

    const onWheel = (e: WheelEvent) => {
      // Check if scroll is intensely vertical
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const isAtLeftEdge = scrollEl.scrollLeft <= 0;
        const isAtRightEdge = Math.ceil(scrollEl.scrollLeft + scrollEl.clientWidth) >= scrollEl.scrollWidth;

        // Allow natural vertical scroll when hitting exact bounds
        if (e.deltaY < 0 && isAtLeftEdge) return; 
        if (e.deltaY > 0 && isAtRightEdge) return; 

        e.preventDefault();
        scrollEl.scrollBy({ left: e.deltaY, behavior: 'auto' });
      }
    };

    scrollEl.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      clearInterval(timer);
      scrollEl.removeEventListener('wheel', onWheel);
    };
  }, []);

  return (
    <section ref={sectionRef} id="organizations" style={{ padding: 'clamp(80px, 10vw, 160px) 0' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 64, padding: '0 24px' }}>
        <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 9999, background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
          For Organizations
        </span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, lineHeight: 1.2 }}>
          Scale Elder Care <span style={{ color: 'var(--sah-accent-1)' }}>Across India</span>
        </h2>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginTop: 12, maxWidth: 600, margin: '12px auto 0' }}>
          Purpose-built for NGOs, old age homes, CSCs, and government healthcare programs.
        </p>
      </motion.div>

      <div className="org-carousel-wrap">
        
        {/* Navigation Arrows */}
        <button onClick={handlePrev} className="org-nav-btn org-nav-prev" aria-label="Previous Feature">
          <ChevronLeft size={24} />
        </button>
        <button onClick={handleNext} className="org-nav-btn org-nav-next" aria-label="Next Feature">
          <ChevronRight size={24} />
        </button>

        {/* Scroll Track */}
        <div ref={scrollRef} className="org-carousel-scroll">
          {ORG_FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              data-index={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: activeIndex === i ? 1 : 0.6, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
              className={`org-card ${activeIndex === i ? 'is-active' : ''}`}
            >
              <div 
                className="org-card-blob" 
                style={{ background: `radial-gradient(circle at top right, ${feature.color}, transparent 55%)` }}
              />
              <span className="org-card-icon">{feature.icon}</span>
              <h3 className="org-card-title">{feature.title}</h3>
              <p className="org-card-desc">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="org-dots">
          {ORG_FEATURES.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={`org-dot ${activeIndex === i ? 'is-active' : ''}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.8 }}
        style={{ textAlign: 'center', marginTop: 64 }}
      >
        <button
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            border: 'none',
            padding: '14px 36px',
            borderRadius: 9999,
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(99,102,241,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Request Enterprise Demo
        </button>
      </motion.div>
    </section>
  );
}
