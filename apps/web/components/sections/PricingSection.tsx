'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check } from 'lucide-react';

const PLANS = [
  {
    name: 'FREE',
    nameSub: 'For Families',
    price: { monthly: 0, annual: 0 },
    color: '#22C55E',
    borderColor: 'rgba(34, 197, 94, 0.15)',
    features: [
      '1 elderly profile',
      'Voice commands (11 languages)',
      'Medication reminders',
      'SOS emergency alerts',
      'Basic AI companion',
      'Government scheme finder',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'FAMILY',
    nameSub: 'For Extended Care',
    price: { monthly: 299, annual: 2499 },
    color: '#FF9933',
    borderColor: 'rgba(255, 153, 51, 0.4)',
    features: [
      'Up to 5 elderly profiles',
      'All Free features +',
      'Family dashboard',
      'Location tracking',
      'Prescription OCR',
      'Priority AI companion',
      'WhatsApp notifications',
      'Call transcription',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'ORGANIZATION',
    nameSub: 'For NGOs & Homes',
    price: { monthly: null, annual: null },
    color: '#A855F7',
    borderColor: 'rgba(168, 85, 247, 0.2)',
    features: [
      'Unlimited profiles',
      'All Family features +',
      'White-label branding',
      'Bulk device management',
      'Custom AI flows',
      'Analytics dashboard',
      'API access',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export function PricingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section ref={sectionRef} id="pricing" style={{ padding: 'clamp(80px, 10vw, 160px) 24px', maxWidth: 1200, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
        animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
        transition={{ duration: 0.8 }}
        style={{ textAlign: 'center', marginBottom: 48 }}
      >
        <span className="section-heading" style={{
          display: 'inline-block', padding: '5px 14px', borderRadius: 9999,
          background: 'rgba(var(--sah-accent-1-rgb),0.1)',
          border: '1px solid rgba(var(--sah-accent-1-rgb),0.15)',
          color: 'var(--sah-accent-1)', fontSize: 12, fontWeight: 600,
          marginBottom: 16, fontFamily: 'var(--font-accent)',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          Pricing
        </span>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)',
          fontWeight: 900, lineHeight: 1.1, fontStyle: 'italic',
        }}>
          Care shouldn&apos;t cost a <span style={{ color: 'var(--sah-accent-1)' }}>fortune</span>
        </h2>
      </motion.div>

      {/* Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 48, gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 14, opacity: isAnnual ? 0.5 : 1, fontWeight: isAnnual ? 400 : 600, transition: 'opacity 0.2s', fontFamily: 'var(--font-body)' }}>Monthly</span>
        <button
          onClick={() => setIsAnnual(!isAnnual)}
          style={{
            width: 52, height: 28, borderRadius: 14, border: 'none',
            background: isAnnual ? 'var(--sah-accent-1)' : 'rgba(255,255,255,0.15)',
            position: 'relative', cursor: 'pointer', transition: 'background 0.3s',
          }}
          aria-label={`Switch to ${isAnnual ? 'monthly' : 'annual'} billing`}
        >
          <span style={{
            position: 'absolute', top: 3, left: isAnnual ? 27 : 3,
            width: 22, height: 22, borderRadius: '50%', background: '#fff',
            transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </button>
        <span style={{ fontSize: 14, opacity: isAnnual ? 1 : 0.5, fontWeight: isAnnual ? 600 : 400, transition: 'opacity 0.2s', fontFamily: 'var(--font-body)' }}>Annual</span>
        {isAnnual && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 9999, background: 'rgba(34,197,94,0.1)', color: '#22C55E', fontWeight: 600, fontFamily: 'var(--font-accent)' }}>Save 30%</span>}
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, alignItems: 'start' }}>
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.name}
            className="glass-card section-card"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={isInView ? { opacity: 1, y: 0, scale: plan.popular ? 1.03 : 1 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
            style={{
              padding: 32,
              position: 'relative',
              borderColor: plan.borderColor,
              ...(plan.popular ? {
                border: `1.5px solid ${plan.borderColor}`,
                boxShadow: `0 4px 24px rgba(0,0,0,0.25), 0 0 60px rgba(255,153,51,0.08)`,
              } : {}),
            }}
          >
            {plan.popular && (
              <span style={{
                position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                background: 'var(--sah-accent-1)', color: '#000',
                fontSize: 11, fontFamily: 'var(--font-accent)', fontWeight: 700,
                letterSpacing: '0.1em', padding: '4px 14px', borderRadius: 9999,
              }}>
                MOST POPULAR
              </span>
            )}

            <h3 style={{
              fontFamily: 'var(--font-accent)', fontSize: 14, fontWeight: 700,
              letterSpacing: '0.1em', color: plan.color, marginBottom: 4,
            }}>
              {plan.name}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, fontFamily: 'var(--font-body)' }}>
              {plan.nameSub}
            </p>

            <div style={{ marginBottom: 24 }}>
              {plan.price.monthly !== null ? (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 44, fontWeight: 900, fontFamily: 'var(--font-display)' }}>
                    ₹{isAnnual ? Math.round((plan.price.annual || 0) / 12) : plan.price.monthly}
                  </span>
                  {plan.price.monthly > 0 && <span style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>/month</span>}
                </div>
              ) : (
                <span style={{ fontSize: 32, fontWeight: 900, fontFamily: 'var(--font-display)' }}>Custom</span>
              )}
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {plan.features.map((feature) => (
                <li key={feature} style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                  <Check size={14} strokeWidth={2.5} style={{ color: '#2D6A4F', flexShrink: 0 }} />
                  {feature}
                </li>
              ))}
            </ul>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%', padding: '12px 24px', borderRadius: 9999,
                border: plan.popular ? 'none' : `1px solid ${plan.borderColor}`,
                background: plan.popular ? `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)` : 'transparent',
                color: plan.popular ? '#000' : plan.color,
                fontWeight: 700, fontSize: 15, cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                boxShadow: plan.popular ? `0 4px 20px rgba(255,153,51,0.25)` : 'none',
                transition: 'box-shadow 0.3s',
              }}
            >
              {plan.cta}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
