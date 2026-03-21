'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Voice Demo', href: '#voice-demo' },
    { label: 'Languages', href: '#languages' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press Kit', href: '#' },
  ],
  Support: [
    { label: 'Help Center', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
};

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
    <footer
      ref={sectionRef}
      style={{
        padding: 'clamp(60px, 8vw, 120px) 24px 32px',
        maxWidth: 1200,
        margin: '0 auto',
        borderTop: '1px solid var(--glass-border)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 48,
          marginBottom: 64,
        }}
      >
        {/* Brand column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 28 }}>🙏</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22 }}>सहायक</span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-muted)', maxWidth: 280 }}>
            India&apos;s first voice-driven AI assistant for elderly smartphones. Because every elder deserves dignity in the digital age.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  color: 'inherit',
                  fontSize: 14,
                  fontWeight: 700,
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,158,44,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255,158,44,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                }}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </motion.div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([title, links], i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1 + 0.1 }}
          >
            <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>{title}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    style={{
                      color: 'inherit',
                      textDecoration: 'none',
                      fontSize: 14,
                      opacity: 0.5,
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5'; }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 24,
          borderTop: '1px solid var(--glass-border)',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} Sahayak. Made with ❤️ in India.
        </p>

        <button
          onClick={scrollToTop}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            padding: '8px 16px',
            borderRadius: 9999,
            color: 'inherit',
            fontSize: 13,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          aria-label="Scroll to top"
        >
          ↑ Back to top
        </button>
      </div>
    </footer>
  );
}
