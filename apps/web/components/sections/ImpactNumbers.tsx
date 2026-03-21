'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import CountUp from 'react-countup';
import { Users, Globe, Zap, Shield, Landmark, Heart } from 'lucide-react';

const METRICS = [
  { value: 140, suffix: 'M+', label: 'Potential Users', description: 'Senior citizens in India who could benefit', icon: Users, color: '#FF9933' },
  { value: 11, suffix: '', label: 'Languages', description: 'Full voice & UI support', icon: Globe, color: '#0EA5E9' },
  { value: 4, suffix: 's', label: 'Avg Response', description: 'Voice command to action time', icon: Zap, color: '#22C55E' },
  { value: 99.9, suffix: '%', label: 'Uptime SLA', description: 'Because emergencies don\'t wait', icon: Shield, color: '#F59E0B' },
  { value: 50, suffix: '+', label: 'Govt Schemes', description: 'Auto-discovered for each elder', icon: Landmark, color: '#A855F7' },
  { value: 0, suffix: '', label: '₹0 for Families', description: 'Free tier — always and forever', icon: Heart, color: '#F43F5E' },
];

export function ImpactNumbers() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      ref={sectionRef}
      id="impact"
      style={{
        padding: 'clamp(80px, 10vw, 160px) 24px',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
        animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
        transition={{ duration: 0.8 }}
        style={{ textAlign: 'center', marginBottom: 64 }}
      >
        <span className="section-heading" style={{
          display: 'inline-block', padding: '5px 14px', borderRadius: 9999,
          background: 'rgba(var(--sah-accent-1-rgb),0.1)',
          border: '1px solid rgba(var(--sah-accent-1-rgb),0.15)',
          color: 'var(--sah-accent-1)', fontSize: 12, fontWeight: 600,
          marginBottom: 16, fontFamily: 'var(--font-accent)',
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          Impact
        </span>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)',
          fontWeight: 900, lineHeight: 1.1, fontStyle: 'italic',
        }}>
          Numbers that <span style={{ color: 'var(--sah-accent-1)' }}>matter</span>
        </h2>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16,
      }}>
        {METRICS.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              className="glass-card section-card"
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 + 0.2 }}
              style={{ padding: 28, textAlign: 'center', cursor: 'default' }}
            >
              <div className="icon-container" style={{ margin: '0 auto 16px' }}>
                <Icon size={26} strokeWidth={1.5} style={{ color: metric.color }} />
              </div>
              <div style={{
                fontSize: 36, fontWeight: 900, fontFamily: 'var(--font-display)',
                color: metric.color, marginBottom: 4,
              }}>
                {metric.label === '₹0 for Families' ? (
                  '₹0'
                ) : isInView ? (
                  <CountUp end={metric.value} duration={2.5} decimals={metric.value % 1 !== 0 ? 1 : 0} suffix={metric.suffix} />
                ) : (
                  `0${metric.suffix}`
                )}
              </div>
              <h3 style={{
                fontSize: 15, fontWeight: 700, marginBottom: 4,
                fontFamily: 'var(--font-accent)',
              }}>
                {metric.label}
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                {metric.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
