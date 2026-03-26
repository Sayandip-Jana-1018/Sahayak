'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { apiRequest } from '@/lib/api';
import {
  Users, MapPin, Globe, Clock, Plus, ArrowRight, Heart,
} from 'lucide-react';

interface ElderProfile {
  id: string;
  name: string;
  ageYears: number | null;
  city: string | null;
  state: string | null;
  primaryLanguage: string | null;
  phoneNumber: string | null;
  isActive: boolean;
  relationship: string;
  lastActiveAt: string | null;
}

const LANG_LABELS: Record<string, string> = {
  hi: 'हिन्दी', ta: 'தமிழ்', bn: 'বাংলা', mr: 'मराठी',
  te: 'తెలుగు', kn: 'ಕನ್ನಡ', gu: 'ગુજરાતી', pa: 'ਪੰਜਾਬੀ',
  ml: 'മലയാളം', ur: 'اردو', en: 'English',
};

const REL_LABELS: Record<string, string> = {
  self: '🙋 Myself',
  parent: '👨‍👩‍👦 Parent',
  grandparent: '👴 Grandparent',
  spouse: '💑 Spouse',
  relative: '👪 Relative',
  organization: '🏢 Organization',
  other: '🤝 Other',
};

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export default function SelectProfilePage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [profiles, setProfiles] = useState<ElderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await apiRequest<{ onboarded: boolean; profiles: ElderProfile[] }>(
          '/api/onboarding/status',
          getToken,
        );
        if (!cancelled) {
          if (!res.onboarded || res.profiles.length === 0) {
            // Not onboarded — redirect to onboarding
            router.replace('/onboarding');
            return;
          }
          setProfiles(res.profiles);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load profiles');
          setLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [getToken, router]);

  function selectProfile(profileId: string) {
    document.cookie = `sahayak_selected_profile=${profileId}; path=/; max-age=31536000; SameSite=Lax`;
    router.push('/dashboard');
  }

  function addNewElder() {
    router.push('/onboarding?addElder=true');
  }

  if (loading) {
    return (
      <div className="sp">
        <div className="sp__loading">
          <div className="sp__spinner" />
          <p>Loading profiles…</p>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sp">
        <div className="sp__error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="sp__retry">Retry</button>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="sp">
      <div className="sp__hero">
        {user?.imageUrl && (
          <div className="sp__avatar-wrap">
            <img src={user.imageUrl} alt="" className="sp__avatar" />
          </div>
        )}
        <h1 className="sp__title">
          {greeting}, <span className="sp__name">{user?.firstName || 'there'}</span>
        </h1>
        <p className="sp__subtitle">
          {profiles.length === 1
            ? 'Here\'s the elder you\'re caring for'
            : `You're caring for ${profiles.length} elders. Choose a profile to continue.`
          }
        </p>
      </div>

      <div className="sp__grid">
        {profiles.map((p) => (
          <div key={p.id} className="sp__card">
            <div className="sp__card-shine" />

            {/* Initials circle */}
            <div className="sp__card-avatar">
              <span>{p.name.charAt(0).toUpperCase()}</span>
            </div>

            <h3 className="sp__card-name">{p.name}</h3>

            {/* Relationship badge */}
            <span className="sp__card-rel">
              {REL_LABELS[p.relationship] || REL_LABELS.other}
            </span>

            {/* Info rows */}
            <div className="sp__card-info">
              {p.ageYears && (
                <div className="sp__card-row">
                  <Heart size={13} />
                  <span>{p.ageYears} years old</span>
                </div>
              )}
              {(p.city || p.state) && (
                <div className="sp__card-row">
                  <MapPin size={13} />
                  <span>{[p.city, p.state].filter(Boolean).join(', ')}</span>
                </div>
              )}
              {p.primaryLanguage && (
                <div className="sp__card-row">
                  <Globe size={13} />
                  <span>{LANG_LABELS[p.primaryLanguage] || p.primaryLanguage}</span>
                </div>
              )}
              <div className="sp__card-row">
                <Clock size={13} />
                <span>Active {relativeTime(p.lastActiveAt)}</span>
              </div>
            </div>

            {/* Status dot */}
            <div className="sp__card-status">
              <span className={`sp__dot ${p.isActive ? 'sp__dot--on' : 'sp__dot--off'}`} />
              <span>{p.isActive ? 'Active' : 'Inactive'}</span>
            </div>

            <button className="sp__card-btn" onClick={() => selectProfile(p.id)}>
              Open Dashboard <ArrowRight size={15} />
            </button>
          </div>
        ))}

        {/* Add New Elder Card */}
        <button className="sp__card sp__card--add" onClick={addNewElder}>
          <div className="sp__add-icon">
            <Plus size={28} strokeWidth={2} />
          </div>
          <h3 className="sp__card-name">Add New Elder</h3>
          <p className="sp__add-desc">Register another family member or organization elder</p>
        </button>
      </div>

      <style jsx>{styles}</style>
    </div>
  );
}

const styles = `
  .sp {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 16px 20px 40px;
  }

  .sp__loading, .sp__error {
    text-align: center;
    color: var(--text-secondary);
    font-family: var(--font-display);
  }

  .sp__spinner {
    width: 36px; height: 36px;
    border: 3px solid var(--glass-border);
    border-top-color: var(--sah-accent-1);
    border-radius: 50%;
    margin: 0 auto 12px;
    animation: sp-spin 0.8s linear infinite;
  }

  @keyframes sp-spin { to { transform: rotate(360deg); } }

  .sp__retry {
    margin-top: 12px;
    padding: 8px 20px;
    border-radius: var(--radius-full);
    background: linear-gradient(135deg, var(--sah-accent-1), var(--sah-accent-2));
    color: #fff;
    border: none;
    cursor: pointer;
    font-weight: 700;
    font-family: var(--font-display);
  }

  /* ═══ HERO ═══ */
  .sp__hero {
    text-align: center;
    margin-bottom: 36px;
  }

  .sp__avatar-wrap {
    width: 72px; height: 72px;
    border-radius: 50%;
    margin: 0 auto 18px;
    padding: 3px;
    background: linear-gradient(135deg, var(--sah-accent-1), var(--sah-accent-2));
    box-shadow: 0 4px 24px rgba(var(--sah-accent-1-rgb), 0.25);
  }

  .sp__avatar {
    width: 100%; height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--bg-primary);
  }

  .sp__title {
    font-size: clamp(22px, 4vw, 30px) !important;
    font-weight: 800 !important;
    font-family: var(--font-display);
    color: var(--text-primary);
    margin: 0 0 8px;
    letter-spacing: -0.03em;
  }

  .sp__name {
    background: linear-gradient(135deg, var(--sah-accent-1), var(--sah-accent-2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .sp__subtitle {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0;
    font-family: var(--font-display);
    max-width: 420px;
  }

  /* ═══ GRID ═══ */
  .sp__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    width: 100%;
    max-width: 920px;
  }

  @media (max-width: 640px) {
    .sp__grid {
      grid-template-columns: 1fr;
      max-width: 380px;
    }
  }

  /* ═══ CARD ═══ */
  .sp__card {
    position: relative;
    padding: 28px 24px;
    border-radius: 22px;
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    box-shadow: var(--glass-shadow);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                box-shadow 0.3s ease,
                border-color 0.3s ease;
    overflow: hidden;
  }

  .sp__card:hover {
    transform: translateY(-4px);
    border-color: var(--glass-border-hover);
    box-shadow: var(--glass-shadow), 0 0 40px rgba(var(--sah-accent-1-rgb), 0.06);
  }

  .sp__card-shine {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg,
      transparent,
      rgba(var(--sah-accent-1-rgb), 0.3),
      rgba(var(--sah-accent-2-rgb), 0.3),
      transparent
    );
  }

  /* ═══ CARD AVATAR ═══ */
  .sp__card-avatar {
    width: 56px; height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(var(--sah-accent-1-rgb), 0.15), rgba(var(--sah-accent-2-rgb), 0.15));
    border: 2px solid var(--glass-border);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 14px;
  }

  .sp__card-avatar span {
    font-size: 22px;
    font-weight: 800;
    font-family: var(--font-display);
    background: linear-gradient(135deg, var(--sah-accent-1), var(--sah-accent-2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .sp__card-name {
    font-size: 18px !important;
    font-weight: 800 !important;
    font-family: var(--font-display);
    color: var(--text-primary);
    margin: 0 0 6px;
    letter-spacing: -0.02em;
  }

  .sp__card-rel {
    font-size: 12px;
    font-weight: 600;
    font-family: var(--font-display);
    color: var(--text-secondary);
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    padding: 4px 12px;
    border-radius: var(--radius-full);
    margin-bottom: 16px;
  }

  /* ═══ INFO ROWS ═══ */
  .sp__card-info {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  .sp__card-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text-secondary);
    font-family: var(--font-display);
  }

  .sp__card-row svg {
    color: var(--text-muted);
    flex-shrink: 0;
  }

  /* ═══ STATUS ═══ */
  .sp__card-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--text-muted);
    font-family: var(--font-display);
    font-weight: 600;
    margin-bottom: 18px;
  }

  .sp__dot {
    width: 8px; height: 8px;
    border-radius: 50%;
  }

  .sp__dot--on {
    background: var(--sah-accent-2);
    box-shadow: 0 0 8px rgba(var(--sah-accent-2-rgb), 0.5);
  }

  .sp__dot--off {
    background: var(--text-muted);
  }

  /* ═══ CTA BUTTON ═══ */
  .sp__card-btn {
    width: 100%;
    padding: 12px 20px;
    border-radius: var(--radius-full);
    background: linear-gradient(135deg, var(--sah-accent-1), var(--sah-accent-2));
    color: #fff;
    border: none;
    cursor: pointer;
    font-weight: 700;
    font-size: 14px;
    font-family: var(--font-display);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 4px 20px rgba(var(--sah-accent-1-rgb), 0.2);
    transition: all 0.2s ease;
  }

  .sp__card-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 30px rgba(var(--sah-accent-1-rgb), 0.35);
  }

  /* ═══ ADD CARD ═══ */
  .sp__card--add {
    cursor: pointer;
    border-style: dashed;
    border-width: 2px;
    background: transparent;
    justify-content: center;
    min-height: 300px;
    transition: all 0.3s ease;
  }

  .sp__card--add:hover {
    background: var(--glass-bg);
    border-color: rgba(var(--sah-accent-1-rgb), 0.3);
  }

  .sp__add-icon {
    width: 56px; height: 56px;
    border-radius: 50%;
    background: var(--glass-bg);
    border: 2px solid var(--glass-border);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 14px;
    color: var(--sah-accent-1);
    transition: all 0.3s ease;
  }

  .sp__card--add:hover .sp__add-icon {
    background: rgba(var(--sah-accent-1-rgb), 0.1);
    border-color: rgba(var(--sah-accent-1-rgb), 0.3);
    transform: scale(1.05);
  }

  .sp__add-desc {
    font-size: 13px;
    color: var(--text-muted);
    font-family: var(--font-display);
    margin: 4px 0 0;
    max-width: 200px;
  }
`;
