'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLocaleStore } from '@/store/localeStore';

const PLANS = [
  {
    id: 'free',
    name: 'FREE',
    nameSub: 'For Families',
    price: { monthly: 0, annual: 0 },
    color: '#22C55E', // Green
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
    id: 'family',
    name: 'FAMILY',
    nameSub: 'For Extended Care',
    price: { monthly: 299, annual: 2499 },
    color: '#F59E0B', // Amber
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
    id: 'org',
    name: 'ORGANIZATION',
    nameSub: 'For NGOs & Homes',
    price: { monthly: null, annual: null },
    color: '#A855F7', // Purple
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
  const { t } = useLocaleStore();

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
          {t('section.pricing')}
        </span>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)',
          fontWeight: 900, lineHeight: 1.1,
        }}>
          {t('pricing.heading')}
        </h2>
      </motion.div>

      {/* Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 64, gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 14, opacity: isAnnual ? 0.5 : 1, fontWeight: isAnnual ? 400 : 700, transition: 'opacity 0.2s', fontFamily: 'var(--font-body)' }}>{t('common.monthly')}</span>
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
        <span style={{ fontSize: 14, opacity: isAnnual ? 1 : 0.5, fontWeight: isAnnual ? 700 : 400, transition: 'opacity 0.2s', fontFamily: 'var(--font-body)' }}>{t('common.annual')}</span>
        {isAnnual && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 9999, background: 'rgba(34,197,94,0.1)', color: '#22C55E', fontWeight: 700, fontFamily: 'var(--font-accent)' }}>{t('common.save30')}</span>}
      </div>

      {/* Pricing Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32, alignItems: 'stretch' }}>
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.name}
            className={`pricing-card pricing-card-${plan.id}`}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: i * 0.15 + 0.2 }}
            style={{ 
              padding: '48px 40px',
              ...(plan.popular ? { transform: 'scale(1.04)' } : {})
            }}
          >
            {/* 4px Solid Color Top Bar */}
            <div className="pricing-top-bar" />

            {/* Soft Radial Glow Tint */}
            <div className={`pricing-blob pricing-blob-${plan.id}`} />

            {/* Floating Popular Badge */}
            {plan.popular && (
              <div style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)',
                background: 'linear-gradient(135deg, #F59E0B, #EA580C)', color: '#fff',
                fontSize: 12, fontFamily: 'var(--font-accent)', fontWeight: 800,
                letterSpacing: '0.12em', padding: '6px 18px', borderRadius: 9999,
                boxShadow: '0 8px 20px rgba(245,158,11,0.3)', zIndex: 20,
                whiteSpace: 'nowrap'
              }}>
                MOST POPULAR
              </div>
            )}

            <h3 style={{
              fontFamily: 'var(--font-accent)', fontSize: 14, fontWeight: 800,
              letterSpacing: '0.15em', color: plan.color, marginBottom: 12,
            }}>
              {plan.name}
            </h3>
            
            {/* Audience Pill */}
            <div style={{ 
              display: 'inline-block',
              background: `${plan.color}26`, /* 15% opacity */
              color: plan.color,
              padding: '6px 14px', borderRadius: 9999,
              fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)',
              marginBottom: 32 
            }}>
              {plan.nameSub}
            </div>

            {/* Massive Price Block */}
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'baseline', gap: 8 }}>
              {plan.price.monthly !== null ? (
                <>
                  <span className="pricing-number" style={{ 
                    fontSize: 64, fontWeight: 900, fontFamily: 'var(--font-display)', 
                    textShadow: `0 0 24px ${plan.color}40`, lineHeight: 1
                  }}>
                    ₹{isAnnual ? Math.round((plan.price.annual || 0) / 12) : plan.price.monthly}
                  </span>
                  {plan.price.monthly > 0 && <span className="pricing-period" style={{ fontSize: 15, fontFamily: 'var(--font-body)', opacity: 0.6 }}>/month</span>}
                </>
              ) : (
                <span className="pricing-number" style={{ 
                  fontSize: 56, fontWeight: 900, fontFamily: 'var(--font-display)', 
                  textShadow: `0 0 24px ${plan.color}40`, lineHeight: 1
                }}>
                  Custom
                </span>
              )}
            </div>

            {/* Glowing Divider */}
            <div style={{ width: '100%', height: 1, background: `linear-gradient(90deg, ${plan.color}80, transparent)`, marginBottom: 32 }} />

            {/* Features List */}
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {plan.features.map((feature) => (
                <li key={feature} className="pricing-list-item">
                  {/* Custom Filled Check Circle */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: plan.color, flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="11" fill="currentColor" fillOpacity="0.15"/>
                    <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* Call to Action Button */}
            <button className={`pricing-btn ${plan.popular ? 'pricing-btn-solid-family' : `pricing-btn-${plan.id === 'org' ? 'ghost-org' : 'solid-free'}`}`}>
              {plan.cta}
            </button>

          </motion.div>
        ))}
      </div>
    </section>
  );
}
