'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, Pill, ShieldCheck, AlertTriangle, Activity, Phone, MessageCircle, Bell, BarChart3, Mic, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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

function StatCard({ icon: Icon, iconColor, label, value, sub, href }: {
  icon: typeof Clock; iconColor: string; label: string; value: string; sub?: string; href?: string;
}) {
  const Card = href ? Link : 'div';
  return (
    <Card href={href || '#'} className="stat-card">
      <div className="stat-card__icon" style={{ background: `${iconColor}15`, color: iconColor }}>
        <Icon size={20} />
      </div>
      <div className="stat-card__info">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__value">{value}</span>
        {sub && <span className="stat-card__sub">{sub}</span>}
      </div>
    </Card>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const config: Record<string, { icon: typeof Mic; color: string }> = {
    voice: { icon: Mic, color: '#3B28CC' },
    sos: { icon: AlertTriangle, color: '#E63946' },
    med_taken: { icon: CheckCircle, color: '#2D6A4F' },
    med_missed: { icon: XCircle, color: '#FFB703' },
  };
  const { icon: Icon, color } = config[type] || config.voice;
  return (
    <div className="activity-icon" style={{ background: `${color}15`, color }}>
      <Icon size={16} />
    </div>
  );
}

export default function DashboardOverviewPage() {
  const { data, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: ['dashboard-overview'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/dashboard/overview`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="dash-overview">
        <div className="dash-overview__grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-line skeleton-line--sm" />
              <div className="skeleton-line skeleton-line--lg" />
              <div className="skeleton-line skeleton-line--sm" />
            </div>
          ))}
        </div>
        <style jsx>{`${skeletonStyles}`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dash-overview__error">
        <AlertTriangle size={24} />
        <p>Failed to load dashboard data</p>
        <button onClick={() => refetch()} className="dash-overview__retry">Retry</button>
      </div>
    );
  }

  const d = data!;
  const meds = d.stats.medicationsToday;
  const medPercent = meds.total > 0 ? (meds.taken / meds.total) * 100 : 0;

  return (
    <div className="dash-overview">
      {/* Stat Cards */}
      <div className="dash-overview__grid">
        <StatCard
          icon={Clock}
          iconColor="#2D6A4F"
          label="Last Active"
          value={relativeTime(d.stats.lastActive)}
          href="/dashboard/health"
        />
        <StatCard
          icon={Pill}
          iconColor="#FFB703"
          label="Medications Today"
          value={`${meds.taken} / ${meds.total} taken`}
          sub={meds.missed > 0 ? `${meds.missed} missed` : undefined}
          href="/dashboard/medications"
        />
        <StatCard
          icon={d.stats.sosEventsThisWeek > 0 ? AlertTriangle : ShieldCheck}
          iconColor={d.stats.sosEventsThisWeek > 0 ? '#E63946' : '#2D6A4F'}
          label="Emergency Alerts"
          value={d.stats.sosEventsThisWeek > 0 ? `${d.stats.sosEventsThisWeek} this week` : 'None this week'}
          href="/dashboard/sos"
        />
        <StatCard
          icon={Activity}
          iconColor="#3B28CC"
          label="Daily Usage"
          value={`${d.stats.dailyUsage} commands`}
          href="/dashboard/health"
        />
      </div>

      {/* Quick Actions */}
      <div className="dash-overview__actions">
        <button className="dash-overview__action-btn">
          <Phone size={16} /> Call Now
        </button>
        <button className="dash-overview__action-btn">
          <MessageCircle size={16} /> Send Message
        </button>
        <button className="dash-overview__action-btn">
          <Bell size={16} /> Add Reminder
        </button>
        <Link href="/dashboard/health" className="dash-overview__action-btn">
          <BarChart3 size={16} /> View Health
        </Link>
      </div>

      {/* Activity Feed */}
      <div className="dash-overview__feed">
        <div className="dash-overview__feed-header">
          <h3>Recent Activity</h3>
        </div>
        {d.recentActivity.length === 0 ? (
          <div className="dash-overview__empty">
            <Activity size={24} />
            <p>No activity yet. Activity will appear here once {d.profile?.name || 'the user'} starts using Sahayak.</p>
          </div>
        ) : (
          <div className="dash-overview__feed-list">
            {d.recentActivity.map((item) => (
              <div key={item.id} className="dash-overview__feed-item">
                <ActivityIcon type={item.type} />
                <div className="dash-overview__feed-info">
                  <span className="dash-overview__feed-text">
                    {item.type === 'voice' && `Said "${(item.text || '').slice(0, 40)}" — ${item.intent || 'unknown'}`}
                    {item.type === 'sos' && `SOS triggered via ${item.triggerType || 'unknown'}`}
                    {item.type === 'med_taken' && 'Medication taken'}
                    {item.type === 'med_missed' && 'Medication missed'}
                  </span>
                  <span className="dash-overview__feed-time">{relativeTime(item.timestamp)}</span>
                </div>
                {item.language && (
                  <span className="dash-overview__feed-lang">{item.language}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .dash-overview {
          max-width: 1100px;
        }

        .dash-overview__grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        :global(.stat-card) {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 20px;
          border-radius: 16px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        :global(.stat-card:hover) {
          border-color: var(--glass-border-hover);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }

        .stat-card__icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-card__info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stat-card__label {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .stat-card__value {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .stat-card__sub {
          font-size: 12px;
          color: #FFB703;
        }

        /* Actions */
        .dash-overview__actions {
          display: flex;
          gap: 10px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .dash-overview__action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          border-radius: 20px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          font-family: var(--font-body);
          text-decoration: none;
          transition: all 0.15s;
        }

        .dash-overview__action-btn:hover {
          background: var(--glass-bg-hover);
          color: var(--text-primary);
          border-color: var(--glass-border-hover);
        }

        /* Feed */
        .dash-overview__feed {
          border-radius: 16px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          overflow: hidden;
        }

        .dash-overview__feed-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--glass-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .dash-overview__feed-header h3 {
          font-size: 15px !important;
          font-weight: 600 !important;
          color: var(--text-primary);
          margin: 0;
        }

        .dash-overview__empty {
          padding: 40px;
          text-align: center;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .dash-overview__empty p {
          font-size: 14px;
          max-width: 400px;
        }

        .dash-overview__feed-list {
          max-height: 500px;
          overflow-y: auto;
        }

        .dash-overview__feed-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          transition: background 0.15s;
        }

        :global(.light) .dash-overview__feed-item,
        :global([data-theme="light"]) .dash-overview__feed-item {
          border-bottom-color: rgba(27,42,74,0.04);
        }

        .dash-overview__feed-item:hover {
          background: rgba(255,255,255,0.02);
        }

        :global(.activity-icon) {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .dash-overview__feed-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .dash-overview__feed-text {
          font-size: 13px;
          color: var(--text-primary);
        }

        .dash-overview__feed-time {
          font-size: 11px;
          color: var(--text-muted);
        }

        .dash-overview__feed-lang {
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 4px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
        }

        /* Error */
        .dash-overview__error {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 60px;
          text-align: center;
          color: #E63946;
        }

        .dash-overview__retry {
          padding: 8px 20px;
          border-radius: 10px;
          background: rgba(230,57,70,0.1);
          border: 1px solid rgba(230,57,70,0.2);
          color: #E63946;
          cursor: pointer;
          font-weight: 500;
          font-family: var(--font-body);
        }

        /* Skeleton */
        ${skeletonStyles}

        @media (max-width: 1024px) {
          .dash-overview__grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .dash-overview__grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

const skeletonStyles = `
  .skeleton-card {
    padding: 20px;
    border-radius: 16px;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .skeleton-line {
    border-radius: 6px;
    background: linear-gradient(90deg, var(--glass-bg) 0%, var(--glass-bg-hover) 50%, var(--glass-bg) 100%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  .skeleton-line--sm {
    height: 12px;
    width: 60%;
  }

  .skeleton-line--lg {
    height: 20px;
    width: 80%;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;
