'use client';

import { useUser } from '@clerk/nextjs';
import { User, Volume2, Moon, Sun, LogOut, Type } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useFontSizeStore, type FontSize } from '@/store/fontSizeStore';

export default function SettingsPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { theme, setTheme } = useTheme();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { fontSize, setFontSize } = useFontSizeStore();

  return (
    <div className="st">
      <div className="st__head">
        <h2 className="st__title">Settings</h2>
        <p className="st__sub">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="st__card">
        <div className="st__card-head">
          <User size={16} />
          <h3>Profile</h3>
        </div>
        {user?.imageUrl && (
          <div className="st__avatar-row">
            <div className="st__avatar-wrap">
              <img src={user.imageUrl} alt={user.fullName || 'Profile'} className="st__avatar" />
            </div>
          </div>
        )}
        <div className="st__row">
          <span className="st__row-label">Name</span>
          <span className="st__row-val">{user?.fullName || '—'}</span>
        </div>
        <div className="st__row">
          <span className="st__row-label">Email</span>
          <span className="st__row-val">{user?.primaryEmailAddress?.emailAddress || '—'}</span>
        </div>
      </div>

      {/* Appearance */}
      <div className="st__card">
        <div className="st__card-head">
          <Moon size={16} />
          <h3>Appearance</h3>
        </div>
        <div className="st__row">
          <span className="st__row-label">Theme</span>
          <div className="st__toggle">
            <button
              className={`st__toggle-btn ${theme === 'dark' ? 'st__toggle-btn--active' : ''}`}
              onClick={() => setTheme('dark')}
            >
              <Moon size={14} /> Dark
            </button>
            <button
              className={`st__toggle-btn ${theme === 'light' ? 'st__toggle-btn--active' : ''}`}
              onClick={() => setTheme('light')}
            >
              <Sun size={14} /> Light
            </button>
          </div>
        </div>
        <div className="st__row">
          <span className="st__row-label">Font Size</span>
          <div className="st__toggle">
            {([
              { key: 'normal' as FontSize, label: 'A', px: '' },
              { key: 'large' as FontSize, label: 'A+', px: '18px' },
              { key: 'xlarge' as FontSize, label: 'A++', px: '22px' },
            ]).map(({ key, label, px }) => (
              <button
                key={key}
                className={`st__toggle-btn ${fontSize === key ? 'st__toggle-btn--active' : ''}`}
                onClick={() => {
                  setFontSize(key);
                  document.body.style.fontSize = px;
                  window.dispatchEvent(new Event('sahayak-fontsize-change'));
                }}
              >
                <Type size={14} /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sound */}
      <div className="st__card">
        <div className="st__card-head">
          <Volume2 size={16} />
          <h3>Sound</h3>
        </div>
        <div className="st__row">
          <span className="st__row-label">Sound Effects</span>
          <button
            className={`st__switch ${soundEnabled ? 'st__switch--on' : ''}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label="Toggle sound"
          >
            <div className="st__switch-thumb" />
          </button>
        </div>
      </div>

      {/* Sign Out */}
      <div className="st__signout-wrap">
        <button className="st__signout" onClick={() => signOut()}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>

      <style jsx>{`${settingsStyles}`}</style>
    </div>
  );
}

const settingsStyles = `
  .st__head { margin-bottom: 24px; text-align: center; }

  .st__title {
    font-size: clamp(20px, 3vw, 26px) !important;
    font-weight: 800 !important;
    color: var(--text-primary);
    margin: 0;
    font-family: var(--font-display);
    letter-spacing: -0.03em;
  }

  .st__sub {
    font-size: 13px;
    color: var(--text-muted);
    margin: 2px 0 0;
    font-family: var(--font-display);
  }

  /* ─── CARD ─── */
  .st__card {
    padding: 20px;
    border-radius: var(--radius-lg);
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    margin-bottom: 14px;
  }

  .st__card-head {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
    margin-bottom: 16px;
  }

  .st__avatar-row {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }

  .st__avatar-wrap {
    width: 72px; height: 72px;
    border-radius: 50%;
    padding: 3px;
    background: linear-gradient(135deg, var(--sah-accent-1), var(--sah-accent-2));
    box-shadow: 0 4px 20px rgba(var(--sah-accent-1-rgb), 0.2);
  }

  .st__avatar {
    width: 100%; height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--bg-primary);
  }

  .st__card-head h3 {
    font-size: 14px !important;
    font-weight: 700 !important;
    color: var(--text-primary);
    margin: 0;
    font-family: var(--font-display);
    letter-spacing: -0.01em;
  }

  /* ─── ROW ─── */
  .st__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid var(--glass-border);
    gap: 12px;
  }

  .st__row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .st__row-label {
    font-size: 14px;
    color: var(--text-secondary);
    font-family: var(--font-display);
    font-weight: 500;
    white-space: nowrap;
  }

  .st__row-val {
    font-size: 14px;
    color: var(--text-primary);
    font-weight: 600;
    font-family: var(--font-display);
    text-align: right;
    word-break: break-all;
  }

  /* ─── TOGGLE ─── */
  .st__toggle {
    display: flex;
    gap: 4px;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-full);
    padding: 3px;
    flex-shrink: 0;
  }

  .st__toggle-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 7px 14px;
    border-radius: var(--radius-full);
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 13px;
    font-family: var(--font-display);
    font-weight: 600;
    transition: all var(--duration-fast) var(--ease-fluid);
    white-space: nowrap;
  }

  .st__toggle-btn:hover {
    color: var(--text-secondary);
  }

  .st__toggle-btn--active {
    background: linear-gradient(135deg, var(--sah-accent-1), var(--sah-accent-2));
    color: #fff !important;
    box-shadow: 0 2px 8px rgba(var(--sah-accent-1-rgb), 0.25);
  }

  /* ─── SWITCH ─── */
  .st__switch {
    width: 48px;
    height: 26px;
    border-radius: 13px;
    background: var(--glass-border);
    border: none;
    cursor: pointer;
    position: relative;
    transition: background var(--duration-normal) var(--ease-fluid);
    flex-shrink: 0;
  }

  .st__switch--on {
    background: linear-gradient(135deg, var(--sah-accent-1), var(--sah-accent-2));
  }

  .st__switch-thumb {
    width: 20px;
    height: 20px;
    border-radius: var(--radius-full);
    background: #fff;
    position: absolute;
    top: 3px;
    left: 3px;
    transition: transform var(--duration-normal) var(--ease-spring);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }

  .st__switch--on .st__switch-thumb {
    transform: translateX(22px);
  }

  /* ─── SIGN OUT ─── */
  .st__signout-wrap {
    display: flex;
    justify-content: center;
    margin-top: 8px;
  }

  .st__signout {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 28px;
    border-radius: var(--radius-full);
    background: rgba(230, 57, 70, 0.08);
    border: 1px solid rgba(230, 57, 70, 0.15);
    color: #E63946;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    font-family: var(--font-display);
    transition: all var(--duration-fast) var(--ease-fluid);
  }

  .st__signout:hover {
    background: rgba(230, 57, 70, 0.14);
    border-color: rgba(230, 57, 70, 0.25);
    transform: translateY(-1px);
  }

  /* ─── RESPONSIVE ─── */
  @media (max-width: 480px) {
    .st__row {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .st__toggle {
      width: 100%;
      justify-content: center;
    }

    .st__toggle-btn {
      padding: 6px 10px;
      font-size: 12px;
    }
  }
`;
