'use client';

import { useUser } from '@clerk/nextjs';
import { User, Globe, Type, Volume2, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';

export default function SettingsPage() {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  return (
    <div className="settings-page">
      <h2 className="settings-page__title">Settings</h2>

      {/* Profile */}
      <div className="settings-card">
        <div className="settings-card__header">
          <User size={18} />
          <h3>Profile</h3>
        </div>
        <div className="settings-card__row">
          <span className="settings-card__label">Name</span>
          <span className="settings-card__value">{user?.fullName || '—'}</span>
        </div>
        <div className="settings-card__row">
          <span className="settings-card__label">Email</span>
          <span className="settings-card__value">{user?.primaryEmailAddress?.emailAddress || '—'}</span>
        </div>
      </div>

      {/* Appearance */}
      <div className="settings-card">
        <div className="settings-card__header">
          <Moon size={18} />
          <h3>Appearance</h3>
        </div>
        <div className="settings-card__row">
          <span className="settings-card__label">Theme</span>
          <div className="settings-toggle">
            <button className={`settings-toggle__btn ${theme === 'dark' ? 'settings-toggle__btn--active' : ''}`}
              onClick={() => setTheme('dark')}>
              <Moon size={14} /> Dark
            </button>
            <button className={`settings-toggle__btn ${theme === 'light' ? 'settings-toggle__btn--active' : ''}`}
              onClick={() => setTheme('light')}>
              <Sun size={14} /> Light
            </button>
          </div>
        </div>
        <div className="settings-card__row">
          <span className="settings-card__label">Font Size</span>
          <div className="settings-toggle">
            {(['normal', 'large', 'xlarge'] as const).map(size => (
              <button key={size} className={`settings-toggle__btn ${fontSize === size ? 'settings-toggle__btn--active' : ''}`}
                onClick={() => setFontSize(size)}>
                {size === 'normal' ? 'A' : size === 'large' ? 'A+' : 'A++'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sound */}
      <div className="settings-card">
        <div className="settings-card__header">
          <Volume2 size={18} />
          <h3>Sound</h3>
        </div>
        <div className="settings-card__row">
          <span className="settings-card__label">Sound Effects</span>
          <button className={`settings-switch ${soundEnabled ? 'settings-switch--on' : ''}`}
            onClick={() => setSoundEnabled(!soundEnabled)} aria-label="Toggle sound">
            <div className="settings-switch__thumb" />
          </button>
        </div>
      </div>

      <style jsx>{`
        .settings-page { max-width: 600px; }
        .settings-page__title { font-size: 22px !important; font-weight: 700 !important; margin-bottom: 24px; color: var(--text-primary); }

        .settings-card { padding: 20px; border-radius: 16px; background: var(--glass-bg); border: 1px solid var(--glass-border); margin-bottom: 16px; }
        .settings-card__header { display: flex; align-items: center; gap: 8px; color: var(--text-primary); margin-bottom: 16px; }
        .settings-card__header h3 { font-size: 15px !important; font-weight: 600 !important; margin: 0; }

        .settings-card__row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
        :global(.light) .settings-card__row { border-bottom-color: rgba(27,42,74,0.04); }
        .settings-card__row:last-child { border-bottom: none; }
        .settings-card__label { font-size: 14px; color: var(--text-secondary); }
        .settings-card__value { font-size: 14px; color: var(--text-primary); font-weight: 500; }

        .settings-toggle { display: flex; gap: 4px; background: rgba(255,255,255,0.04); border-radius: 10px; padding: 3px; }
        :global(.light) .settings-toggle { background: rgba(27,42,74,0.04); }
        .settings-toggle__btn { display: flex; align-items: center; gap: 4px; padding: 6px 14px; border-radius: 8px; background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 13px; font-family: var(--font-body); font-weight: 500; transition: all 0.15s; }
        .settings-toggle__btn--active { background: #FF6B2C; color: white; }

        .settings-switch { width: 44px; height: 24px; border-radius: 12px; background: rgba(255,255,255,0.1); border: none; cursor: pointer; position: relative; transition: background 0.2s; }
        :global(.light) .settings-switch { background: rgba(27,42,74,0.1); }
        .settings-switch--on { background: #FF6B2C; }
        .settings-switch__thumb { width: 18px; height: 18px; border-radius: 50%; background: white; position: absolute; top: 3px; left: 3px; transition: transform 0.2s; }
        .settings-switch--on .settings-switch__thumb { transform: translateX(20px); }
      `}</style>
    </div>
  );
}
