'use client';

import { Heart, Github, Twitter, Linkedin, Mail, Phone, MapPin, ArrowUp } from 'lucide-react';

const FOOTER_LINKS = {
  product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Demo', href: '#demo' },
    { label: 'Languages', href: '#languages' },
    { label: 'Download App', href: '#download' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press Kit', href: '/press' },
    { label: 'Contact', href: '/contact' },
  ],
  resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'API Reference', href: '/api-docs' },
    { label: 'NGO Partnerships', href: '#organizations' },
    { label: 'Government Programs', href: '/government' },
    { label: 'Accessibility', href: '/accessibility' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Data Protection', href: '/data-protection' },
  ],
} as const;

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      style={{
        background: '#050510',
        padding: '80px 24px 32px',
        position: 'relative',
      }}
    >
      {/* Top gradient border */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: 'linear-gradient(90deg, var(--sah-saffron), var(--sah-indigo), var(--sah-jade))',
          opacity: 0.5,
        }}
      />

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* CTA banner */}
        <div
          className="glass-card glass-card--no-hover"
          style={{
            padding: '48px 40px',
            marginBottom: 80,
            textAlign: 'center',
            background: 'rgba(255,107,44,0.05)',
            borderColor: 'rgba(255,107,44,0.15)',
          }}
        >
          <h2 style={{
            fontFamily: 'var(--font-syne)',
            fontSize: 'clamp(24px, 3.5vw, 44px)',
            fontWeight: 700,
            color: '#F8F6FF',
            lineHeight: 1.15,
            marginBottom: 12,
          }}>
            Give your loved ones the{' '}
            <span className="gradient-text-saffron">gift of independence.</span>
          </h2>
          <p style={{
            fontSize: 17,
            color: 'rgba(248,246,255,0.6)',
            fontFamily: 'var(--font-jakarta)',
            marginBottom: 28,
          }}>
            Download Sahayak today. It&apos;s free and takes 5 minutes to set up.
          </p>
          <a
            href="#download"
            className="ring-pulse"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '16px 40px',
              borderRadius: 9999,
              background: 'var(--sah-saffron)',
              color: 'white',
              fontFamily: 'var(--font-syne)',
              fontWeight: 600,
              fontSize: 17,
              textDecoration: 'none',
              boxShadow: '0 4px 20px var(--sah-saffron-glow)',
              transition: 'all 0.2s',
            }}
          >
            Download Free →
          </a>
        </div>

        {/* Footer columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
            gap: 48,
            marginBottom: 64,
          }}
          className="footer-grid"
        >
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" stroke="url(#logo-grad-footer)" strokeWidth="2" />
                <path d="M10 16c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="var(--sah-saffron)" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 18c0 2.2 1.8 4 4 4s4-1.8 4-4" stroke="var(--sah-indigo-light)" strokeWidth="2" strokeLinecap="round" />
                <circle cx="16" cy="12" r="1.5" fill="var(--sah-saffron)" />
                <defs>
                  <linearGradient id="logo-grad-footer" x1="0" y1="0" x2="32" y2="32">
                    <stop offset="0%" stopColor="var(--sah-saffron)" />
                    <stop offset="100%" stopColor="var(--sah-indigo)" />
                  </linearGradient>
                </defs>
              </svg>
              <span
                style={{
                  fontFamily: 'var(--font-syne)',
                  fontWeight: 700,
                  fontSize: 20,
                  background: 'linear-gradient(135deg, var(--sah-saffron), var(--sah-indigo-light))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                सहायक
              </span>
            </div>
            <p style={{
              fontSize: 14,
              color: 'rgba(248,246,255,0.5)',
              lineHeight: 1.7,
              fontFamily: 'var(--font-jakarta)',
              maxWidth: 280,
              marginBottom: 24,
            }}>
              India&apos;s first voice-first AI operating system for elderly smartphones.
              No typing. No passwords. Just speak.
            </p>
            {/* Contact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href="mailto:hello@sahayak.in" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'rgba(248,246,255,0.4)' }}>
                <Mail size={14} /> hello@sahayak.in
              </a>
              <a href="tel:+911800SAHAYAK" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'rgba(248,246,255,0.4)' }}>
                <Phone size={14} /> 1800-SAHAYAK (toll free)
              </a>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'rgba(248,246,255,0.4)' }}>
                <MapPin size={14} /> Bengaluru, India 🇮🇳
              </span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(248,246,255,0.7)',
                fontFamily: 'var(--font-syne)',
                marginBottom: 16,
              }}>
                {section}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.map(link => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      style={{
                        fontSize: 14,
                        color: 'rgba(248,246,255,0.4)',
                        textDecoration: 'none',
                        fontFamily: 'var(--font-jakarta)',
                        transition: 'color 0.2s',
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 32,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <p style={{
            fontSize: 13,
            color: 'rgba(248,246,255,0.3)',
            fontFamily: 'var(--font-jakarta)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            © {new Date().getFullYear()} Sahayak Technologies Pvt. Ltd. Made with
            <Heart size={14} fill="var(--sah-saffron)" stroke="var(--sah-saffron)" />
            in India
          </p>

          {/* Social */}
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { icon: Twitter, href: '#', label: 'Twitter' },
              { icon: Linkedin, href: '#', label: 'LinkedIn' },
              { icon: Github, href: '#', label: 'GitHub' },
            ].map(social => {
              const IconComp = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: 'rgba(248,246,255,0.4)',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <IconComp size={16} />
                </a>
              );
            })}
          </div>

          {/* Scroll to top */}
          <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 32px !important;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
