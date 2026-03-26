'use client';

import { motion, useInView } from 'framer-motion';
import { ArrowUpRight, Github, Linkedin, Mail, PlayCircle } from 'lucide-react';
import { useRef } from 'react';

const PRODUCT_LINKS = [
  { label: 'Voice demo', href: '#voice-demo' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Languages', href: '#languages' },
  { label: 'Pricing', href: '#pricing' },
];

const SUPPORT_LINKS = [
  { label: 'Caregiver dashboard', href: '/login' },
  { label: 'Contact team', href: 'mailto:hello@sahayak.in' },
  { label: 'Privacy policy', href: '#' },
  { label: 'Terms of service', href: '#' },
];

const SOCIAL_LINKS = [
  { label: 'GitHub', icon: Github, href: 'https://github.com/Sayandip-Jana-1018/Sahayak' },
  { label: 'LinkedIn', icon: Linkedin, href: '#' },
  { label: 'YouTube', icon: PlayCircle, href: '#' },
  { label: 'Email', icon: Mail, href: 'mailto:hello@sahayak.in' },
];

export function Footer() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="sah-footer-separator" />

      <footer ref={sectionRef} className="sah-footer">
        <div className="sah-footer-blob-left" />
        <div className="sah-footer-blob-right" />

        <div className="sah-footer-inner">
          <div className="sah-footer-grid">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <h4 className="sah-footer-col-title">Product</h4>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                {PRODUCT_LINKS.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="sah-footer-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{ textAlign: 'center' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, var(--sah-accent-1), var(--sah-accent-2))',
                    color: '#120f0a',
                    fontWeight: 800,
                    fontFamily: 'var(--font-display)',
                    boxShadow: '0 8px 24px rgba(var(--sah-accent-1-rgb), 0.22)',
                  }}
                >
                  SA
                </span>
                <span
                  className="sah-footer-logo"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 900,
                    fontSize: 30,
                    letterSpacing: '-0.04em',
                  }}
                >
                  Sahayak
                </span>
              </div>

              <div
                style={{
                  width: 46,
                  height: 3,
                  borderRadius: 999,
                  background: 'linear-gradient(90deg, var(--sah-accent-1), #ffba6b)',
                  margin: '0 auto 18px',
                }}
              />

              <p
                className="sah-footer-tagline"
                style={{
                  fontSize: 14,
                  lineHeight: 1.8,
                  maxWidth: 360,
                  margin: '0 auto',
                }}
              >
                Voice-first phone assistance for India, built elderly-first and shaped to feel calm,
                trustworthy, and genuinely beautiful to use.
              </p>

              <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'center' }}>
                {SOCIAL_LINKS.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className="sah-footer-social"
                      target={social.href.startsWith('http') ? '_blank' : undefined}
                      rel={social.href.startsWith('http') ? 'noreferrer' : undefined}
                    >
                      <Icon size={16} />
                    </a>
                  );
                })}
              </div>

              <div style={{ marginTop: 28 }}>
                <p className="sah-footer-cta-text" style={{ fontSize: 13, marginBottom: 12 }}>
                  Start with the experience, then move into the caregiver dashboard when you are ready.
                </p>
                <a href="/login" className="sah-footer-cta-btn">
                  Launch dashboard
                  <ArrowUpRight size={14} />
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ textAlign: 'right' }}
            >
              <h4 className="sah-footer-col-title">Support</h4>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                {SUPPORT_LINKS.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="sah-footer-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 24,
              borderTop: '1px solid rgba(255,255,255,0.08)',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <p className="sah-footer-copyright" style={{ fontSize: 13 }}>
              © {new Date().getFullYear()} Sahayak. Designed and built in India.
            </p>

            <button onClick={scrollToTop} className="sah-footer-top-btn" aria-label="Scroll to top">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
              Back to top
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
