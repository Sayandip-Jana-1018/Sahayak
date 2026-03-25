'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth, useUser } from '@clerk/nextjs';
import { Clock, Pill, ShieldCheck, AlertTriangle, Activity, Phone, MessageCircle, Bell, BarChart3, Mic, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { apiRequest } from '@/lib/api';

const LocationMapCard = dynamic(() => import('@/components/dashboard/LocationMapCard'), { ssr: false });

interface DashboardData {
  profile: {
    id: string;
    name: string;
    ageYears: number;
    primaryLanguage: string;
    lastActiveAt: string | null;
    batteryLevel: number | null;
    state: string;
  } | null;
  stats: {
    lastActive: string | null;
    medicationsToday: { taken: number; total: number; pending: number; missed: number };
    sosEventsThisWeek: number;
    dailyUsage: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    text?: string;
    intent?: string;
    status?: string;
    triggerType?: string;
    language?: string;
    timestamp: string;
  }>;
  location: {
    lat: number | null;
    lng: number | null;
    address: string | null;
    updatedAt: string | null;
  };
}

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

const ACTIVITY_CONFIG: Record<string, { icon: typeof Mic; color: string }> = {
  voice: { icon: Mic, color: 'var(--sah-accent-2)' },
  sos: { icon: AlertTriangle, color: '#E63946' },
  med_taken: { icon: CheckCircle, color: 'var(--sah-accent-2)' },
  med_missed: { icon: XCircle, color: 'var(--sah-accent-1)' },
};

export default function DashboardOverviewPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { data, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: ['dashboard-overview'],
    queryFn: () => apiRequest<DashboardData>('/api/dashboard/overview', getToken),
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="ov">
        <div className="ov__grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="ov__skel">
              <div className="ov__skel-circle" />
              <div className="ov__skel-line ov__skel-line--sm" />
              <div className="ov__skel-line ov__skel-line--lg" />
            </div>
          ))}
        </div>
        <style jsx>{`${styles}`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ov__error-wrap">
        <div className="ov__error-card">
          <AlertTriangle size={28} />
          <p>Failed to load dashboard</p>
          <button onClick={() => refetch()} className="ov__error-btn">Retry</button>
        </div>
        <style jsx>{`${styles}`}</style>
      </div>
    );
  }

  const d = data!;
  const meds = d.stats.medicationsToday;
  const medPercent = meds.total > 0 ? Math.round((meds.taken / meds.total) * 100) : 0;
  const profileName = d.profile?.name || 'your loved one';
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="ov">
      {/* ── Welcome ── */}
      <div className="ov__hero">
        {user?.imageUrl && (
          <div className="ov__avatar-wrap">
            <img src={user.imageUrl} alt={user.firstName || 'Profile'} className="ov__avatar" />
          </div>
        )}
        <h1 className="ov__hero-h1">
          {greeting}, <span className="ov__hero-name">{user?.firstName || 'Caregiver'}</span> 👋
        </h1>
        <p className="ov__hero-sub">
          Here&apos;s how <strong>{profileName}</strong> is doing today
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="ov__grid">
        <Link href="/dashboard/health" className="ov__card ov__card--last-active">
          <div className="ov__card-shine" />
          <div className="ov__card-icon"><Clock size={22} strokeWidth={1.8} /></div>
          <span className="ov__card-label">Last Active</span>
          <span className="ov__card-value">{relativeTime(d.stats.lastActive)}</span>
        </Link>

        <Link href="/dashboard/medications" className="ov__card ov__card--meds">
          <div className="ov__card-shine" />
          <div className="ov__card-icon"><Pill size={22} strokeWidth={1.8} /></div>
          <span className="ov__card-label">Medications</span>
          <span className="ov__card-value">{meds.taken}/{meds.total} taken</span>
          {meds.total > 0 && (
            <div className="ov__card-progress">
              <div className="ov__card-progress-fill" style={{ width: `${medPercent}%` }} />
            </div>
          )}
        </Link>

        <Link href="/dashboard/sos" className="ov__card ov__card--sos">
          <div className="ov__card-shine" />
          <div className="ov__card-icon">
            {d.stats.sosEventsThisWeek > 0 ? <AlertTriangle size={22} strokeWidth={1.8} /> : <ShieldCheck size={22} strokeWidth={1.8} />}
          </div>
          <span className="ov__card-label">Emergency</span>
          <span className="ov__card-value">
            {d.stats.sosEventsThisWeek > 0 ? `${d.stats.sosEventsThisWeek} alerts` : 'All clear ✓'}
          </span>
        </Link>

        <Link href="/dashboard/health" className="ov__card ov__card--usage">
          <div className="ov__card-shine" />
          <div className="ov__card-icon"><Activity size={22} strokeWidth={1.8} /></div>
          <span className="ov__card-label">Daily Usage</span>
          <span className="ov__card-value">{d.stats.dailyUsage} commands</span>
        </Link>
      </div>

      {/* ── Location Map ── */}
      <LocationMapCard
        lat={d.location?.lat ?? null}
        lng={d.location?.lng ?? null}
        address={d.location?.address}
        updatedAt={d.location?.updatedAt}
        batteryLevel={d.profile?.batteryLevel ?? null}
        elderlyName={profileName}
      />

      {/* ── Quick Actions ── */}
      <div className="ov__actions">
        <button className="ov__action"><Phone size={15} /> Call</button>
        <button className="ov__action"><MessageCircle size={15} /> Message</button>
        <button className="ov__action"><Bell size={15} /> Reminder</button>
        <Link href="/dashboard/health" className="ov__action"><BarChart3 size={15} /> Health</Link>
      </div>

      {/* ── Activity Feed ── */}
      <div className="ov__feed">
        <div className="ov__feed-head">
          <h3>Recent Activity</h3>
        </div>
        {d.recentActivity.length === 0 ? (
          <div className="ov__feed-empty">
            <Activity size={24} strokeWidth={1.5} />
            <p>No activity yet</p>
            <span>Activity will appear here once {profileName} starts using Sahayak.</span>
          </div>
        ) : (
          <div className="ov__feed-list">
            {d.recentActivity.map((item) => {
              const cfg = ACTIVITY_CONFIG[item.type] || ACTIVITY_CONFIG.voice;
              const Icon = cfg.icon;
              return (
                <div key={item.id} className="ov__feed-row">
                  <div className="ov__feed-dot" style={{ background: cfg.color }} />
                  <div className="ov__feed-icon" style={{ color: cfg.color }}><Icon size={16} /></div>
                  <div className="ov__feed-info">
                    <span className="ov__feed-text">
                      {item.type === 'voice' && `Said "${(item.text || '').slice(0, 40)}" — ${item.intent || 'unknown'}`}
                      {item.type === 'sos' && `SOS triggered via ${item.triggerType || 'unknown'}`}
                      {item.type === 'med_taken' && 'Medication taken ✓'}
                      {item.type === 'med_missed' && 'Medication missed'}
                    </span>
                    <span className="ov__feed-time">{relativeTime(item.timestamp)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`${styles}`}</style>
    </div>
  );
}

const styles = `
  .ov { text-align: center; }

  /* ═══ HERO ═══ */
  .ov__hero { margin-bottom: 32px; }

  .ov__avatar-wrap {
    width: 64px; height: 64px;
    border-radius: 50%;
    margin: 0 auto 16px;
    padding: 3px;
    background: linear-gradient(135deg, var(--sah-accent-1), var(--sah-accent-2));
    box-shadow: 0 4px 20px rgba(var(--sah-accent-1-rgb), 0.25);
  }

  .ov__avatar {
    width: 100%; height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--bg-primary);
  }

  .ov__hero-h1 {
    font-size: clamp(24px, 4vw, 32px) !important;
    font-weight: 800 !important;
    font-family: var(--font-display);
    color: var(--text-primary);
    margin: 0 0 8px;
    letter-spacing: -0.04em;
    line-height: 1.15;
  }

  .ov__hero-name {
    background: linear-gradient(135deg, var(--sah-accent-1), var(--sah-accent-2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .ov__hero-sub {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0;
    font-family: var(--font-display);
  }

  .ov__hero-sub strong {
    color: var(--sah-accent-1);
    font-weight: 600;
  }

  /* ═══ STAT CARDS — 3D Glass with Individual Gradients ═══ */
  .ov__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 24px;
  }

  .ov__card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 24px 16px 20px;
    border-radius: 20px;
    text-decoration: none;
    cursor: pointer;
    overflow: hidden;
    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s;

    /* 3D Glass Base */
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    box-shadow: var(--glass-shadow);
  }

  .ov__card:hover {
    transform: translateY(-4px) scale(1.02);
  }

  /* Shine sweep overlay */
  .ov__card-shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      115deg,
      transparent 30%,
      rgba(255, 255, 255, 0.08) 50%,
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.4s;
    pointer-events: none;
  }

  .ov__card:hover .ov__card-shine { opacity: 1; }

  /* Individual card gradient tints */
  .ov__card--last-active {
    border-color: rgba(99, 102, 241, 0.15);
  }
  .ov__card--last-active:hover {
    box-shadow: 0 12px 40px rgba(99, 102, 241, 0.15), var(--glass-shadow);
  }

  .ov__card--meds {
    border-color: rgba(var(--sah-accent-1-rgb), 0.15);
  }
  .ov__card--meds:hover {
    box-shadow: 0 12px 40px rgba(var(--sah-accent-1-rgb), 0.15), var(--glass-shadow);
  }

  .ov__card--sos {
    border-color: rgba(var(--sah-accent-2-rgb), 0.15);
  }
  .ov__card--sos:hover {
    box-shadow: 0 12px 40px rgba(var(--sah-accent-2-rgb), 0.15), var(--glass-shadow);
  }

  .ov__card--usage {
    border-color: rgba(168, 85, 247, 0.15);
  }
  .ov__card--usage:hover {
    box-shadow: 0 12px 40px rgba(168, 85, 247, 0.12), var(--glass-shadow);
  }

  .ov__card-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 2px;
  }

  .ov__card--last-active .ov__card-icon {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05));
    color: #6366F1;
  }

  .ov__card--meds .ov__card-icon {
    background: linear-gradient(135deg, rgba(var(--sah-accent-1-rgb), 0.15), rgba(var(--sah-accent-1-rgb), 0.05));
    color: var(--sah-accent-1);
  }

  .ov__card--sos .ov__card-icon {
    background: linear-gradient(135deg, rgba(var(--sah-accent-2-rgb), 0.15), rgba(var(--sah-accent-2-rgb), 0.05));
    color: var(--sah-accent-2);
  }

  .ov__card--usage .ov__card-icon {
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(168, 85, 247, 0.05));
    color: #A855F7;
  }

  .ov__card-label {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-family: var(--font-display);
  }

  .ov__card-value {
    font-size: 18px;
    font-weight: 800;
    color: var(--text-primary);
    font-family: var(--font-display);
    letter-spacing: -0.02em;
  }

  .ov__card-progress {
    width: 80%;
    height: 4px;
    border-radius: 2px;
    background: var(--glass-border);
    margin-top: 4px;
    overflow: hidden;
  }

  .ov__card-progress-fill {
    height: 100%;
    border-radius: 2px;
    background: linear-gradient(90deg, var(--sah-accent-1), var(--sah-accent-2));
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ═══ QUICK ACTIONS ═══ */
  .ov__actions {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-top: 24px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .ov__action {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    border-radius: 50px;
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    font-family: var(--font-display);
    text-decoration: none;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    letter-spacing: -0.01em;
  }

  .ov__action:hover {
    background: var(--glass-bg-hover);
    color: var(--text-primary);
    border-color: var(--glass-border-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  /* ═══ ACTIVITY FEED ═══ */
  .ov__feed {
    border-radius: 20px;
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    overflow: hidden;
    text-align: left;
  }

  .ov__feed-head {
    padding: 16px 20px;
    border-bottom: 1px solid var(--glass-border);
  }

  .ov__feed-head h3 {
    font-size: 14px !important;
    font-weight: 700 !important;
    color: var(--text-primary);
    margin: 0;
    font-family: var(--font-display);
  }

  .ov__feed-empty {
    padding: 48px 24px;
    text-align: center;
    color: var(--text-muted);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .ov__feed-empty p {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-secondary);
    margin: 4px 0 0;
    font-family: var(--font-display);
  }

  .ov__feed-empty span {
    font-size: 13px;
    max-width: 300px;
    line-height: 1.5;
  }

  .ov__feed-list { max-height: 360px; overflow-y: auto; }

  .ov__feed-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    border-bottom: 1px solid var(--glass-border);
    transition: background 0.15s;
  }

  .ov__feed-row:last-child { border-bottom: none; }
  .ov__feed-row:hover { background: var(--glass-bg-hover); }

  .ov__feed-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .ov__feed-icon {
    width: 28px; height: 28px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    opacity: 0.7;
  }

  .ov__feed-info {
    flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0;
  }

  .ov__feed-text {
    font-size: 13px;
    color: var(--text-primary);
    font-family: var(--font-display);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
  }

  .ov__feed-time {
    font-size: 11px;
    color: var(--text-muted);
    font-family: var(--font-display);
  }

  /* ═══ ERROR ═══ */
  .ov__error-wrap {
    display: flex;
    justify-content: center;
    padding: 60px 20px;
  }

  .ov__error-card {
    display: flex; flex-direction: column; align-items: center; gap: 12px;
    padding: 40px;
    border-radius: 20px;
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    color: #E63946;
  }

  .ov__error-card p { color: var(--text-secondary); margin: 0; font-size: 14px; }

  .ov__error-btn {
    padding: 8px 24px;
    border-radius: 50px;
    background: rgba(230, 57, 70, 0.1);
    border: 1px solid rgba(230, 57, 70, 0.2);
    color: #E63946;
    cursor: pointer;
    font-weight: 600;
    font-family: var(--font-display);
  }

  /* ═══ SKELETON ═══ */
  .ov__skel {
    padding: 24px 16px;
    border-radius: 20px;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .ov__skel-circle {
    width: 48px; height: 48px; border-radius: 14px;
    background: linear-gradient(90deg, var(--glass-bg) 0%, var(--glass-bg-hover) 50%, var(--glass-bg) 100%);
    background-size: 200%;
    animation: ov-shimmer 1.5s infinite;
  }

  .ov__skel-line {
    border-radius: 6px;
    background: linear-gradient(90deg, var(--glass-bg) 0%, var(--glass-bg-hover) 50%, var(--glass-bg) 100%);
    background-size: 200%;
    animation: ov-shimmer 1.5s infinite;
  }

  .ov__skel-line--sm { height: 10px; width: 60%; }
  .ov__skel-line--lg { height: 16px; width: 45%; }

  @keyframes ov-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ═══ RESPONSIVE ═══ */
  @media (max-width: 520px) {
    .ov__grid {
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .ov__card {
      padding: 18px 12px 16px;
    }

    .ov__card-icon {
      width: 40px; height: 40px; border-radius: 12px;
    }

    .ov__card-value { font-size: 16px; }

    .ov__actions { gap: 6px; margin-top: 12px; }
    .ov__action { padding: 8px 14px; font-size: 12px; }
  }
`;
