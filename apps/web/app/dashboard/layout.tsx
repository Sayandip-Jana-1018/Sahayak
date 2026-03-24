'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import {
  LayoutDashboard, Pill, Heart, MapPin, AlertTriangle,
  Settings, Volume2, Bell,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/medications', icon: Pill, label: 'Medications' },
  { href: '/dashboard/health', icon: Heart, label: 'Health' },
  { href: '/dashboard/sos', icon: AlertTriangle, label: 'SOS History' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

const MOBILE_TABS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/dashboard/medications', icon: Pill, label: 'Meds' },
  { href: '/dashboard/health', icon: Heart, label: 'Health' },
  { href: '/dashboard/sos', icon: AlertTriangle, label: 'SOS' },
  { href: '/dashboard/settings', icon: Settings, label: 'More' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useUser();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  const pageTitle = (() => {
    const item = NAV_ITEMS.find((i) => isActive(i.href));
    return item?.label || 'Dashboard';
  })();

  return (
    <div className="dash-layout">
      {/* Desktop Sidebar */}
      <aside className="dash-sidebar">
        <div className="dash-sidebar__top">
          <div className="dash-sidebar__brand">
            <div className="dash-sidebar__logo">स</div>
            <span className="dash-sidebar__brand-text">Dashboard</span>
          </div>

          <div className="dash-sidebar__user">
            <div className="dash-sidebar__avatar">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="" className="dash-sidebar__avatar-img" />
              ) : (
                <span>{user?.firstName?.[0] || 'U'}</span>
              )}
            </div>
            <div className="dash-sidebar__user-info">
              <span className="dash-sidebar__user-name">{user?.fullName || 'User'}</span>
              <span className="dash-sidebar__user-email">{user?.primaryEmailAddress?.emailAddress || ''}</span>
            </div>
          </div>

          <div className="dash-sidebar__divider" />

          <nav className="dash-sidebar__nav">
            {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={`dash-sidebar__link ${isActive(href) ? 'dash-sidebar__link--active' : ''}`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="dash-main">
        {/* Top bar */}
        <header className="dash-topbar">
          <h1 className="dash-topbar__title">{pageTitle}</h1>
          <div className="dash-topbar__actions">
            <button className="dash-topbar__icon-btn" aria-label="Toggle sound">
              <Volume2 size={20} />
            </button>
            <button className="dash-topbar__icon-btn" aria-label="Notifications">
              <Bell size={20} />
            </button>
            <div className="dash-topbar__avatar">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="" className="dash-topbar__avatar-img" />
              ) : (
                <span>{user?.firstName?.[0] || 'U'}</span>
              )}
            </div>
          </div>
        </header>

        <main className="dash-content">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="dash-mobile-nav">
        {MOBILE_TABS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`dash-mobile-nav__tab ${isActive(href) ? 'dash-mobile-nav__tab--active' : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <style jsx>{`
        .dash-layout {
          display: flex;
          min-height: 100vh;
          background: var(--bg-primary);
        }

        /* ─── SIDEBAR ─── */
        .dash-sidebar {
          width: 260px;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          padding: 20px 16px;
          border-right: 1px solid var(--glass-border);
          background: var(--bg-primary);
          z-index: 50;
          overflow-y: auto;
        }

        :global(.light) .dash-sidebar,
        :global([data-theme="light"]) .dash-sidebar {
          background: var(--bg-primary);
          border-right-color: rgba(27,42,74,0.08);
        }

        .dash-sidebar__top {
          flex: 1;
        }

        .dash-sidebar__brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          margin-bottom: 20px;
        }

        .dash-sidebar__logo {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #FF6B2C, #FF8F5E);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
          font-family: 'Noto Sans Devanagari', sans-serif;
        }

        .dash-sidebar__brand-text {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .dash-sidebar__user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 12px;
          background: var(--glass-bg);
          margin-bottom: 16px;
        }

        .dash-sidebar__avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 107, 44, 0.15);
          color: #FF6B2C;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          overflow: hidden;
          flex-shrink: 0;
        }

        .dash-sidebar__avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .dash-sidebar__user-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .dash-sidebar__user-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dash-sidebar__user-email {
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dash-sidebar__divider {
          height: 1px;
          background: var(--glass-border);
          margin: 8px 12px 12px;
        }

        .dash-sidebar__nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .dash-sidebar__link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.15s ease;
          border-left: 3px solid transparent;
        }

        .dash-sidebar__link:hover {
          background: var(--glass-bg-hover);
          color: var(--text-primary);
        }

        .dash-sidebar__link--active {
          border-left-color: #FF6B2C;
          background: rgba(255, 107, 44, 0.08);
          color: #FF6B2C;
          font-weight: 600;
        }

        /* ─── MAIN ─── */
        .dash-main {
          flex: 1;
          margin-left: 260px;
          min-height: 100vh;
        }

        .dash-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid var(--glass-border);
          position: sticky;
          top: 0;
          background: var(--bg-primary);
          z-index: 40;
          backdrop-filter: blur(12px);
        }

        :global(.light) .dash-topbar,
        :global([data-theme="light"]) .dash-topbar {
          border-bottom-color: rgba(27,42,74,0.06);
          background: rgba(255,251,240,0.9);
        }

        .dash-topbar__title {
          font-size: 20px !important;
          font-weight: 700 !important;
          color: var(--text-primary);
          margin: 0;
        }

        .dash-topbar__actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dash-topbar__icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }

        .dash-topbar__icon-btn:hover {
          background: var(--glass-bg-hover);
          color: var(--text-primary);
        }

        .dash-topbar__avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 107, 44, 0.15);
          color: #FF6B2C;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          overflow: hidden;
          margin-left: 4px;
        }

        .dash-topbar__avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .dash-content {
          padding: 24px;
        }

        /* ─── MOBILE NAV ─── */
        .dash-mobile-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 56px;
          border-top: 1px solid var(--glass-border);
          background: var(--bg-primary);
          backdrop-filter: blur(16px);
          z-index: 50;
          justify-content: space-around;
          align-items: center;
          padding: 0 8px;
        }

        :global(.light) .dash-mobile-nav,
        :global([data-theme="light"]) .dash-mobile-nav {
          background: rgba(255,251,240,0.95);
          border-top-color: rgba(27,42,74,0.08);
        }

        .dash-mobile-nav__tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 500;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.15s;
        }

        .dash-mobile-nav__tab--active {
          color: #FF6B2C;
        }

        @media (max-width: 768px) {
          .dash-sidebar {
            display: none;
          }

          .dash-main {
            margin-left: 0;
            padding-bottom: 60px;
          }

          .dash-mobile-nav {
            display: flex;
          }

          .dash-content {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}
