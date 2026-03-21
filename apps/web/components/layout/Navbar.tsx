'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import Image from 'next/image';
import { useThemeStore, colorThemes } from '@/store/themeStore';
import { useLocaleStore, type Locale } from '@/store/localeStore';

/* ── SVG Icon Components ── */
const IconFeatures = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
);
const IconHow = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
const IconImpact = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
);
const IconPricing = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
);
const IconNGO = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
const IconSun = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
);
const IconMoon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
);
const IconPalette = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="10.5" r="2.5" /><circle cx="8.5" cy="7.5" r="2.5" /><circle cx="6.5" cy="12.5" r="2.5" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></svg>
);
const IconGlobe = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
);

const NAV_LINKS = [
  { key: 'nav.features', href: '#features', icon: IconFeatures, color: '#FF9933' },
  { key: 'nav.howItWorks', href: '#how-it-works', icon: IconHow, color: '#0EA5E9' },
  { key: 'nav.impact', href: '#impact', icon: IconImpact, color: '#22C55E' },
  { key: 'nav.pricing', href: '#pricing', icon: IconPricing, color: '#A855F7' },
  { key: 'nav.forNGOs', href: '#organizations', icon: IconNGO, color: '#F43F5E' },
];

const LANGUAGES: { code: Locale; label: string; flag: string }[] = [
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'bn', label: 'বাংলা', flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
  { code: 'gu', label: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', label: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ur', label: 'اردو', flag: '🇮🇳' },
];

/* ── Glassmorphic dropdown style helper ── */
const dropdownStyle = (isDark: boolean): React.CSSProperties => ({
  position: 'absolute', top: '100%', right: 0, marginTop: 12,
  background: isDark ? 'rgba(10, 10, 20, 0.92)' : 'rgba(255, 251, 240, 0.95)',
  backdropFilter: 'blur(30px) saturate(180%)',
  WebkitBackdropFilter: 'blur(30px) saturate(180%)',
  borderRadius: 16,
  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(27,42,74,0.1)'}`,
  padding: 6, zIndex: 100,
  boxShadow: isDark
    ? '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset'
    : '0 20px 60px rgba(27,42,74,0.1), 0 0 0 1px rgba(255,255,255,0.6) inset',
});

/* ── Icon button style ── */
const iconBtnStyle = (isDark: boolean): React.CSSProperties => ({
  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(27,42,74,0.04)',
  border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(27,42,74,0.06)'}`,
  padding: '7px 8px', borderRadius: 10, cursor: 'pointer',
  color: 'var(--text-secondary)', lineHeight: 1,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'background 0.2s, border-color 0.2s, color 0.2s',
});

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isColorOpen, setIsColorOpen] = useState(false);
  const { setTheme: setDarkLight, resolvedTheme } = useTheme();
  const { activeTheme, setTheme: setColorTheme } = useThemeStore();
  const { locale, setLocale, t } = useLocaleStore();
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => { setMounted(true); }, []);
  useMotionValueEvent(scrollY, 'change', (v: number) => setIsScrolled(v > 50));

  const isDark = resolvedTheme === 'dark';

  const toggleDarkLight = useCallback(() => {
    setDarkLight(isDark ? 'light' : 'dark');
  }, [isDark, setDarkLight]);

  const scrollTo = useCallback((href: string) => {
    setIsMobileMenuOpen(false); setIsColorOpen(false); setIsLangOpen(false);
    const el = document.getElementById(href.replace('#', ''));
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsLangOpen(false); setIsColorOpen(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  return (
    <>
      <motion.nav
        ref={navRef}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          position: 'fixed', top: 14, left: 0, right: 0, width: '100%',
          display: 'flex', justifyContent: 'center', zIndex: 50,
          pointerEvents: 'none',
        }}
      >
        {/* ── Glassmorphic Pill ── */}
        <div
          className="navbar-pill"
          style={{
            pointerEvents: 'all',
            maxWidth: 900,
            width: 'calc(100% - 40px)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            gap: 8, padding: '8px 16px',
            borderRadius: 20,
            background: isScrolled
              ? isDark ? 'rgba(10, 10, 20, 0.88)' : 'rgba(255, 251, 240, 0.92)'
              : isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(28px) saturate(200%)',
            WebkitBackdropFilter: 'blur(28px) saturate(200%)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(27,42,74,0.06)'}`,
            boxShadow: isScrolled
              ? isDark
                ? '0 8px 40px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04) inset'
                : '0 8px 40px rgba(27,42,74,0.06), 0 1px 0 rgba(255,255,255,0.7) inset'
              : 'none',
            transition: 'background 0.4s, box-shadow 0.4s, border-color 0.4s',
          }}
        >
          {/* LEFT: Logo */}
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none',
            color: 'var(--text-primary)', flexShrink: 0,
          }}>
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              style={{
                width: 32, height: 32, borderRadius: 10,
                overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(var(--sah-accent-1-rgb), 0.3)',
              }}
            >
              <Image
                src="/logo/sahayak-icon.png"
                alt="Sahayak"
                width={32}
                height={32}
                style={{ objectFit: 'contain', borderRadius: 50 }}
              />
            </motion.div>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17,
              letterSpacing: '-0.01em',
            }}>सहायक</span>
          </Link>

          {/* CENTER: Nav Links with colored icons */}
          <div className="navbar-links-center" style={{
            flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2,
          }}>
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  style={{
                    background: 'none', border: 'none',
                    padding: '6px 10px', borderRadius: 10,
                    display: 'flex', alignItems: 'center', gap: 5,
                    color: 'var(--text-secondary)', fontSize: 12.5, fontWeight: 500,
                    cursor: 'pointer', transition: 'all 0.2s',
                    fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = link.color;
                    e.currentTarget.style.background = isDark
                      ? 'rgba(255,255,255,0.06)' : 'rgba(27,42,74,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  <span style={{ color: link.color, display: 'flex' }}><Icon /></span>
                  {t(link.key)}
                </button>
              );
            })}
          </div>

          {/* RIGHT: Actions */}
          <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            {/* Color Theme */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { setIsColorOpen(!isColorOpen); setIsLangOpen(false); }}
                style={iconBtnStyle(isDark)}
                aria-label="Color theme"
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--sah-accent-1)'; e.currentTarget.style.color = 'var(--sah-accent-1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(27,42,74,0.06)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <IconPalette />
              </button>
              <AnimatePresence>
                {isColorOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    style={{ ...dropdownStyle(isDark), minWidth: 200 }}
                  >
                    {colorThemes.map((ct) => (
                      <button
                        key={ct.name}
                        onClick={() => { setColorTheme(ct); setIsColorOpen(false); }}
                        style={{
                          display: 'flex', width: '100%', alignItems: 'center', gap: 10,
                          padding: '8px 10px', borderRadius: 10, border: 'none',
                          background: activeTheme.name === ct.name
                            ? isDark ? 'rgba(255,255,255,0.06)' : 'rgba(27,42,74,0.04)' : 'transparent',
                          color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer', textAlign: 'left',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(27,42,74,0.04)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = activeTheme.name === ct.name ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(27,42,74,0.04)') : 'transparent'}
                      >
                        <div style={{ display: 'flex', gap: 3 }}>
                          <span style={{ background: ct.accent1, width: 14, height: 14, borderRadius: '50%', display: 'block', border: '1px solid rgba(255,255,255,0.15)' }} />
                          <span style={{ background: ct.accent2, width: 14, height: 14, borderRadius: '50%', display: 'block', border: '1px solid rgba(255,255,255,0.15)' }} />
                        </div>
                        <span style={{ flex: 1, fontSize: 12.5 }}>{ct.name}</span>
                        {activeTheme.name === ct.name && <span style={{ color: ct.accent1, fontSize: 13 }}>✓</span>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dark/Light */}
            {mounted && (
              <motion.button
                onClick={toggleDarkLight}
                whileHover={{ scale: 1.1, rotate: isDark ? 45 : -15 }}
                whileTap={{ scale: 0.9 }}
                style={iconBtnStyle(isDark)}
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              >
                {isDark ? <IconSun /> : <IconMoon />}
              </motion.button>
            )}

            {/* Language */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { setIsLangOpen(!isLangOpen); setIsColorOpen(false); }}
                style={{
                  ...iconBtnStyle(isDark),
                  gap: 4, padding: '6px 8px', fontSize: 11, fontWeight: 700,
                }}
                aria-label="Select language"
              >
                <IconGlobe />
                <span style={{ letterSpacing: '0.04em' }}>{locale.toUpperCase()}</span>
              </button>
              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    style={{ ...dropdownStyle(isDark), minWidth: 170, maxHeight: 320, overflowY: 'auto' }}
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { setLocale(lang.code); setIsLangOpen(false); }}
                        style={{
                          display: 'flex', width: '100%', alignItems: 'center', gap: 8,
                          padding: '7px 10px', borderRadius: 10, border: 'none',
                          background: locale === lang.code
                            ? isDark ? 'rgba(255,255,255,0.06)' : 'rgba(27,42,74,0.04)' : 'transparent',
                          color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer', textAlign: 'left',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(27,42,74,0.04)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = locale === lang.code ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(27,42,74,0.04)') : 'transparent'}
                      >
                        <span>{lang.flag}</span>
                        <span style={{ flex: 1 }}>{lang.label}</span>
                        {locale === lang.code && <span style={{ color: activeTheme.accent1 }}>✓</span>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CTA — glassmorphic gradient */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollTo('#pricing')}
              className="navbar-cta-desktop"
              style={{
                background: `linear-gradient(135deg, var(--sah-accent-1), var(--sah-accent-2))`,
                border: 'none', padding: '7px 16px', borderRadius: 10,
                color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                letterSpacing: '0.02em', whiteSpace: 'nowrap',
                boxShadow: '0 2px 12px rgba(var(--sah-accent-1-rgb), 0.3)',
              }}
            >
              {t('nav.getStarted')}
            </motion.button>

            {/* Hamburger */}
            <button
              className="navbar-hamburger"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                ...iconBtnStyle(isDark),
                fontSize: 18, display: 'none',
              }}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 999,
              background: isDark ? 'rgba(5,5,12,0.97)' : 'rgba(255,251,240,0.97)',
              backdropFilter: 'blur(30px)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 16,
              padding: '80px 24px 40px',
            }}
          >
            <button onClick={() => setIsMobileMenuOpen(false)} style={{
              position: 'absolute', top: 20, right: 20, background: 'none',
              border: 'none', fontSize: 24, color: 'var(--text-primary)', cursor: 'pointer',
            }}>✕</button>

            {NAV_LINKS.map((link, i) => {
              const Icon = link.icon;
              return (
                <motion.button
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 + 0.1 }}
                  onClick={() => scrollTo(link.href)}
                  style={{
                    background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 10,
                    color: 'var(--text-primary)', fontSize: 20, fontWeight: 600,
                    fontFamily: 'var(--font-display)', cursor: 'pointer', padding: '8px 16px',
                  }}
                >
                  <span style={{ color: link.color }}><Icon /></span>
                  {t(link.key)}
                </motion.button>
              );
            })}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
              style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              {colorThemes.map((ct) => (
                <button key={ct.name} onClick={() => setColorTheme(ct)} title={ct.name}
                  style={{
                    background: `linear-gradient(135deg, ${ct.accent1}, ${ct.accent2})`,
                    width: 30, height: 30, borderRadius: '50%',
                    border: activeTheme.name === ct.name ? '2px solid var(--text-primary)' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', maxWidth: 300 }}>
              {LANGUAGES.map((lang) => (
                <button key={lang.code}
                  onClick={() => { setLocale(lang.code); setIsMobileMenuOpen(false); }}
                  style={{
                    padding: '5px 10px', borderRadius: 8,
                    background: locale === lang.code ? activeTheme.accent1 : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(27,42,74,0.04)',
                    color: locale === lang.code ? '#000' : 'var(--text-secondary)',
                    border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  }}
                >{lang.label}</button>
              ))}
            </motion.div>

            {mounted && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
                onClick={toggleDarkLight} style={{
                  ...iconBtnStyle(isDark), padding: '10px 24px', gap: 8, fontSize: 14,
                }}>
                {isDark ? <><IconSun /> Light Mode</> : <><IconMoon /> Dark Mode</>}
              </motion.button>
            )}

            <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }} onClick={() => scrollTo('#pricing')}
              style={{
                background: `linear-gradient(135deg, var(--sah-accent-1), var(--sah-accent-2))`,
                border: 'none', padding: '12px 32px', borderRadius: 12,
                color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 8,
              }}>
              {t('nav.getStarted')}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
