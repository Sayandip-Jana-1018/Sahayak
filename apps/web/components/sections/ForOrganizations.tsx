'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const ORG_FEATURES = [
  { title: 'White-Label Platform', description: 'Add your logo, brand colors, and custom workflows.', icon: '🎨' },
  { title: 'Bulk Device Management', description: 'Deploy across 100s of devices from a single dashboard.', icon: '📱' },
  { title: 'Custom AI Flows', description: 'Tailor voice commands and responses for your use case.', icon: '🤖' },
  { title: 'Analytics Dashboard', description: 'Track engagement, health metrics, and outcomes at scale.', icon: '📊' },
  { title: 'API Access', description: 'Integrate Sahayak with existing EHR and care management systems.', icon: '🔌' },
  { title: 'Priority Support', description: 'Dedicated account manager and 24/7 technical support.', icon: '🛡️' },
];

export function ForOrganizations() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section ref={sectionRef} id="organizations" style={{ padding: 'clamp(80px, 10vw, 160px) 24px', maxWidth: 1200, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 64 }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {ORG_FEATURES.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: i * 0.08 + 0.2 }}
            className="glass-card"
            style={{
              padding: 28,
              borderRadius: 16,
              display: 'flex',
              gap: 16,
              alignItems: 'flex-start',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: 32, flexShrink: 0 }}>{feature.icon}</span>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{feature.title}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-secondary)' }}>{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.8 }}
        style={{ textAlign: 'center', marginTop: 48 }}
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
