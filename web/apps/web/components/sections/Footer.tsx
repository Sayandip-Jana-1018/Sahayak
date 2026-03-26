'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const PRODUCT_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Voice Demo', href: '#voice-demo' },
  { label: 'Languages', href: '#languages' },
];

const SUPPORT_LINKS = [
  { label: 'Help Center', href: '#' },
  { label: 'Contact', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
];

const SOCIAL_LINKS = [
  { label: 'Twitter', icon: '𝕏', href: '#' },
  { label: 'LinkedIn', icon: 'in', href: '#' },
  { label: 'GitHub', icon: '⌘', href: '#' },
  { label: 'YouTube', icon: '▶', href: '#' },
];

export function Footer() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* India-flag gradient separator */}
      <div className="sah-footer-separator" />

      <footer ref={sectionRef} className="sah-footer">
        {/* Background glow blobs */}
        <div className="sah-footer-blob-left" />
        <div className="sah-footer-blob-right" />

        <div className="sah-footer-inner">
          {/* 3-Column: Product | Brand Center | Support */}
          <div className="sah-footer-grid">

            {/* LEFT — Product Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <h4 className="sah-footer-col-title">Product</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {PRODUCT_LINKS.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="sah-footer-link">{link.label}</a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* CENTER — Brand */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 36 }}>🙏</span>
                <span className="sah-footer-logo" style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 28 }}>सहायक</span>
              </div>
              {/* Warm amber underline accent */}
              <div style={{ width: 40, height: 3, borderRadius: 2, background: 'linear-gradient(90deg, #F59E0B, #EA580C)', margin: '0 auto 20px' }} />

              <p className="sah-footer-tagline" style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 320, margin: '0 auto' }}>
                India&apos;s first voice-driven AI assistant for elderly smartphones. Because every elder deserves dignity in the digital age.
              </p>

              <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'center' }}>
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="sah-footer-social"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>

              {/* Mini CTA */}
              <div style={{ marginTop: 28 }}>
                <p className="sah-footer-cta-text" style={{ fontSize: 13, marginBottom: 12 }}>
                  Start for free. No credit card needed.
                </p>
                <a href="#pricing" className="sah-footer-cta-btn">
                  Get Started →
                </a>
              </div>
            </motion.div>

            {/* RIGHT — Support Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ textAlign: 'right' }}
            >
              <h4 className="sah-footer-col-title">Support</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {SUPPORT_LINKS.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="sah-footer-link">{link.label}</a>
                  </li>
                ))}
              </ul>
            </motion.div>

          </div>

          {/* Bottom copyright bar */}
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
              © {new Date().getFullYear()} Sahayak. Made with ❤️ in India.
            </p>

            <button
              onClick={scrollToTop}
              className="sah-footer-top-btn"
              aria-label="Scroll to top"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
