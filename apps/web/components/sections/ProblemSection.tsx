'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import CountUp from 'react-countup';

const STATS = [
  { value: 140, suffix: 'M+', label: 'Senior citizens in India', icon: '👴' },
  { value: 65, suffix: '%', label: 'Miss medications regularly', icon: '💊' },
  { value: 73, suffix: '%', label: 'Feel digitally excluded', icon: '📱' },
  { value: 48, suffix: '%', label: 'Live alone or with spouse only', icon: '🏠' },
];

export function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section
      ref={sectionRef}
      id="problem"
      style={{
        padding: 'clamp(80px, 10vw, 160px) 24px',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: 64 }}
      >
        <span
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: 9999,
            background: 'rgba(239,68,68,0.1)',
            color: '#ef4444',
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          The Problem
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 800,
            lineHeight: 1.2,
            maxWidth: 600,
            margin: '0 auto',
          }}
        >
          India&apos;s Elders Are Being{' '}
          <span style={{ color: '#ef4444' }}>Left Behind</span>
        </h2>
      </motion.div>

      {/* Stat cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 24,
          marginBottom: 64,
        }}
      >
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
            style={{
              padding: 32,
              borderRadius: 20,
              textAlign: 'center',
              transition: 'transform 0.3s, border-color 0.3s',
            }}
            className="glass-card"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
            }}
          >
            <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>
              {stat.icon}
            </span>
            <div
              style={{
                fontSize: 40,
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                color: '#ef4444',
                marginBottom: 8,
              }}
            >
              {isInView ? (
                <CountUp end={stat.value} duration={2} suffix={stat.suffix} />
              ) : (
                `0${stat.suffix}`
              )}
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Emotional quote */}
      <motion.blockquote
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.8 }}
        style={{
          textAlign: 'center',
          maxWidth: 700,
          margin: '0 auto',
          padding: '32px 24px',
          borderLeft: '4px solid rgba(239,68,68,0.3)',
          borderRadius: 8,
          background: 'rgba(239,68,68,0.03)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-accent)',
            fontSize: 'clamp(20px, 3vw, 28px)',
            lineHeight: 1.4,
            opacity: 0.8,
            fontStyle: 'italic',
          }}
        >
          &ldquo;मेरे बच्चे कहते हैं फोन से सब हो जाता है, पर मुझे तो बटन भी नहीं दिखते।&rdquo;
        </p>
        <footer
          style={{
            marginTop: 16,
            fontSize: 14,
            opacity: 0.5,
          }}
        >
          — Kamla Devi, 72, Varanasi
        </footer>
      </motion.blockquote>
    </section>
  );
}
