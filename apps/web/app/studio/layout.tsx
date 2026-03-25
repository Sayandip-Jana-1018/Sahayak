'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import {
  LayoutDashboard, Smartphone, Mic, BookOpen, BarChart3, Settings, ChevronLeft, Bell,
} from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';
import OfflineBanner from '@/components/ui/OfflineBanner';
import NotificationDrawer from '@/components/dashboard/NotificationDrawer';
import { useNotificationStore } from '@/store/notificationStore';

const STUDIO_NAV = [
  { href: '/studio', icon: LayoutDashboard, label: 'Overview', color: '#6366F1' },
  { href: '/studio/devices', icon: Smartphone, label: 'Devices', color: '#10B981' },
  { href: '/studio/flows', icon: Mic, label: 'Voice Flows', color: '#F59E0B' },
  { href: '/studio/content', icon: BookOpen, label: 'Content', color: '#8B5CF6' },
  { href: '/studio/analytics', icon: BarChart3, label: 'Analytics', color: '#EF4444' },
];

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const isActive = (href: string) =>
    href === '/studio' ? pathname === '/studio' : pathname.startsWith(href);

  return (
    <div className="dash-shell">
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* ── DESKTOP: Left sidebar ── */}
      <nav className="side-nav" aria-label="Studio navigation" role="navigation">
        <Link href="/dashboard" className="side-nav__back" title="Back to Dashboard">
          <ChevronLeft size={16} />
        </Link>
        <div className="side-nav__logo side-nav__logo--studio">S</div>
        <button className="side-nav__bell" onClick={() => setDrawerOpen(true)} aria-label="Notifications">
          <Bell size={18} strokeWidth={1.8} />
          {unreadCount > 0 && <span className="side-nav__bell-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </button>
        {STUDIO_NAV.map(({ href, icon: Icon, label, color }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} className="side-nav__link" data-active={active || undefined}>
              <span
                className="side-nav__icon-bubble"
                style={{
                  color,
                  background: active ? hexToRgba(color, 0.15) : 'transparent',
                  boxShadow: active ? `0 0 14px ${hexToRgba(color, 0.25)}` : 'none',
                }}
              >
                <Icon size={18} strokeWidth={active ? 2.0 : 1.8} />
              </span>
              <span className="side-nav__txt" style={{ color }}>{label}</span>
              {active && (
                <span className="side-nav__bar" style={{ background: color, boxShadow: `0 0 12px ${color}` }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── MOBILE: Bottom bar ── */}
      <nav className="bot-nav" aria-label="Studio navigation">
        <div className="bot-nav__track">
          {STUDIO_NAV.map(({ href, icon: Icon, label, color }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href} className="bot-nav__tab" data-active={active || undefined}>
                <span style={{ color, display: 'flex' }}>
                  <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                </span>
                <span className="bot-nav__txt" style={{ color }}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="dash-main" role="main">
        <div id="main-content" className="dash-main__inner"><ErrorBoundary>{children}</ErrorBoundary></div>
      </main>

      <OfflineBanner />
      <NotificationDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <style jsx global>{`
        /* ═══════════════════ SKIP LINK (A11y) ═══════════════════ */
        .skip-link {
          position: fixed;
          top: -100%;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10001;
          padding: 12px 24px;
          border-radius: 0 0 12px 12px;
          background: var(--sah-accent-1, #FF6B2C);
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          transition: top 0.2s ease;
        }

        .skip-link:focus {
          top: 0;
          outline: 2px solid #fff;
          outline-offset: 2px;
        }

        /* ═══════════════════ DESKTOP SIDEBAR ═══════════════════ */
        .side-nav { display: none; }

        @media (min-width: 768px) {
          .side-nav {
            position: fixed;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 100;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            padding: 14px 8px;
            border-radius: 22px;
            background: rgba(12, 12, 24, 0.75);
            backdrop-filter: blur(40px) saturate(200%);
            -webkit-backdrop-filter: blur(40px) saturate(200%);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 8px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05);
          }

          .light .side-nav,
          [data-theme="light"] .side-nav {
            background: rgba(255, 255, 255, 0.9);
            border-color: rgba(0, 0, 0, 0.06);
            box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.95);
          }
        }

        .side-nav__logo {
          width: 34px; height: 34px;
          border-radius: 11px;
          background: linear-gradient(135deg, var(--sah-accent-1), var(--sah-accent-2));
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; font-weight: 700;
          font-family: var(--font-hindi);
          margin-bottom: 6px;
          flex-shrink: 0;
        }

        .side-nav__logo--studio {
          background: linear-gradient(135deg, #8B5CF6, #6366F1) !important;
          font-family: var(--font-display) !important;
        }

        .side-nav__back {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px; height: 28px;
          border-radius: 8px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          text-decoration: none;
          margin-bottom: 4px;
          transition: all 0.2s ease;
        }

        .side-nav__back:hover {
          color: var(--text-primary);
          background: var(--glass-bg-hover);
        }

        .side-nav__bell {
          position: relative;
          width: 38px; height: 38px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.25s ease;
          margin-bottom: 4px;
          flex-shrink: 0;
        }

        .side-nav__bell:hover {
          color: var(--text-primary);
          background: var(--glass-bg-hover, rgba(255,255,255,0.06));
        }

        .side-nav__bell-dot {
          position: absolute;
          top: 4px; right: 4px;
          min-width: 16px; height: 16px;
          border-radius: 8px;
          background: var(--sah-rose, #FF4B8A);
          color: #fff;
          font-size: 9px;
          font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          padding: 0 3px;
          pointer-events: none;
        }

        .side-nav__link {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          text-decoration: none;
          padding: 8px 6px;
          border-radius: 14px;
          width: 68px;
          opacity: 0.75;
          transition: opacity 0.25s, transform 0.25s;
          position: relative;
        }

        .side-nav__link:hover { opacity: 0.9; }
        .side-nav__link[data-active] { opacity: 1; }

        .side-nav__icon-bubble {
          width: 38px; height: 38px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 4px;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .side-nav__link[data-active] .side-nav__icon-bubble {
          transform: scale(1.08);
        }

        .side-nav__txt {
          font-size: 10px; font-weight: 800;
          font-family: var(--font-display);
          letter-spacing: 0.04em;
          line-height: 1; white-space: nowrap;
        }

        .side-nav__divider {
          width: 32px;
          height: 1px;
          background: var(--glass-border);
          margin: 4px auto;
        }

        .side-nav__bar {
          position: absolute;
          right: -8px; top: 50%;
          transform: translateY(-50%);
          width: 3.5px; height: 20px;
          border-radius: 3px 0 0 3px;
        }

        /* ═══════════════════ MOBILE BOTTOM BAR ═══════════════════ */
        .bot-nav { display: none; }

        @media (max-width: 767px) {
          .bot-nav {
            position: fixed; bottom: 0; left: 0; right: 0;
            z-index: 100;
            padding: 0 8px 8px;
            display: flex; justify-content: center;
          }

          .bot-nav__track {
            width: 100%;
            display: flex; align-items: center; justify-content: space-around;
            padding: 6px 4px;
            border-radius: 20px;
            background: rgba(12, 12, 24, 0.78);
            backdrop-filter: blur(40px) saturate(200%);
            -webkit-backdrop-filter: blur(40px) saturate(200%);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 -2px 30px rgba(0, 0, 0, 0.15), 0 8px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.06);
          }

          .light .bot-nav__track,
          [data-theme="light"] .bot-nav__track {
            background: rgba(255, 255, 255, 0.9);
            border-color: rgba(0, 0, 0, 0.05);
            box-shadow: 0 -2px 30px rgba(0, 0, 0, 0.04), 0 8px 30px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.95);
          }

          .bot-nav__tab {
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            text-align: center;
            gap: 2px;
            padding: 6px 8px;
            border-radius: 14px;
            text-decoration: none;
            opacity: 0.45;
            transition: opacity 0.25s;
            min-width: 44px;
          }

          .bot-nav__tab[data-active] { opacity: 1; }

          .bot-nav__txt {
            font-size: 9px; font-weight: 700;
            font-family: var(--font-display);
            letter-spacing: 0.02em; line-height: 1;
          }
        }

        /* ═══════════════════ MAIN CONTENT — CENTERED ═══════════════════ */
        .dash-main {
          position: relative; z-index: 1;
          padding: 88px 20px 120px;
          min-height: 100vh;
        }

        .dash-main__inner {
          max-width: 720px;
          margin: 0 auto;
        }

        @media (max-width: 480px) {
          .dash-main { padding: 80px 14px 100px; }
        }
      `}</style>
    </div>
  );
}
