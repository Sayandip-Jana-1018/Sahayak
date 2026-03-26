'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { Activity, AlertTriangle, Heart, BarChart3 } from 'lucide-react';
import { apiRequest } from '@/lib/api';

/* The API returns this shape from /api/dashboard/health-data */
interface HealthData {
  activityChart: { labels: string[]; data: number[] };
  medicationAdherence: { labels: string[]; taken: number[]; missed: number[] };
  healthNotes: unknown[];
  appointments: unknown[];
}

export default function HealthPage() {
  const { getToken } = useAuth();
  const { data, isLoading, error, refetch } = useQuery<HealthData>({
    queryKey: ['dashboard-health'],
    queryFn: () => apiRequest('/api/dashboard/health-data', getToken),
  });

  /* Safely transform API shape into renderable arrays */
  const activityDays = (data?.activityChart?.labels || []).map((label, i) => ({
    date: label,
    count: data?.activityChart?.data?.[i] ?? 0,
  }));

  const medDays = (data?.medicationAdherence?.labels || []).map((label, i) => ({
    date: label,
    taken: data?.medicationAdherence?.taken?.[i] ?? 0,
    missed: data?.medicationAdherence?.missed?.[i] ?? 0,
  }));

  return (
    <div className="hp">
      <div className="hp__head">
        <h2 className="hp__title">Health Overview</h2>
        <p className="hp__sub">Activity and medication adherence</p>
      </div>

      {isLoading ? (
        <div className="hp__skels">
          {[1, 2, 3].map(i => (
            <div key={i} className="hp__skel" />
          ))}
        </div>
      ) : error ? (
        <div className="hp__error">
          <div className="hp__error-card">
            <AlertTriangle size={28} />
            <p>Failed to load health data</p>
            <button onClick={() => refetch()} className="hp__retry">Retry</button>
          </div>
        </div>
      ) : (
        <>
          {/* Voice Activity Chart */}
          <div className="hp__card">
            <div className="hp__card-head">
              <div className="hp__card-icon hp__card-icon--indigo">
                <Activity size={16} />
              </div>
              <h3>Voice Activity</h3>
              <span className="hp__card-badge">30 days</span>
            </div>
            <div className="hp__chart">
              {activityDays.length === 0 ? (
                <div className="hp__chart-empty">
                  <Activity size={20} strokeWidth={1.5} />
                  <span>No activity data yet</span>
                </div>
              ) : (
                <div className="hp__chart-bars">
                  {activityDays.map((day, i) => {
                    const max = Math.max(...activityDays.map(d => d.count), 1);
                    return (
                      <div key={i} className="hp__chart-col" title={`${day.date}: ${day.count} commands`}>
                        <div className="hp__chart-bar" style={{ height: `${(day.count / max) * 100}%` }} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="hp__row">
            {/* Medication Adherence */}
            <div className="hp__card">
              <div className="hp__card-head">
                <div className="hp__card-icon hp__card-icon--green">
                  <Heart size={16} />
                </div>
                <h3>Medication Adherence</h3>
              </div>
              {medDays.length === 0 ? (
                <div className="hp__chart-empty"><span>No medication data yet</span></div>
              ) : (
                <div className="hp__chart hp__chart--sm">
                  <div className="hp__chart-bars">
                    {medDays.slice(-14).map((day, i) => {
                      const total = day.taken + day.missed;
                      return (
                        <div key={i} className="hp__chart-col" title={`${day.date}: ${day.taken} taken, ${day.missed} missed`}>
                          {total > 0 && (
                            <>
                              <div className="hp__chart-bar hp__chart-bar--green" style={{ height: `${(day.taken / total) * 100}%` }} />
                              <div className="hp__chart-bar hp__chart-bar--red" style={{ height: `${(day.missed / total) * 100}%` }} />
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Health Notes */}
            <div className="hp__card">
              <div className="hp__card-head">
                <div className="hp__card-icon hp__card-icon--amber">
                  <BarChart3 size={16} />
                </div>
                <h3>Health Notes</h3>
              </div>
              <div className="hp__chart-empty">
                <span>No health notes yet</span>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`${healthStyles}`}</style>
    </div>
  );
}

const healthStyles = `
  /* ─── HEADER ─── */
  .hp__head { margin-bottom: 24px; text-align: center; }

  .hp__title {
    font-size: clamp(20px, 3vw, 26px) !important;
    font-weight: 800 !important;
    color: var(--text-primary);
    margin: 0;
    font-family: var(--font-display);
    letter-spacing: -0.03em;
  }

  .hp__sub {
    font-size: 13px;
    color: var(--text-muted);
    margin: 4px 0 0;
    font-family: var(--font-display);
  }

  /* ─── CARD ─── */
  .hp__card {
    padding: 20px;
    border-radius: 20px;
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    margin-bottom: 14px;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s;
  }

  .hp__card:hover {
    transform: translateY(-2px);
    box-shadow: var(--glass-shadow);
  }

  .hp__card-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    color: var(--text-secondary);
  }

  .hp__card-icon {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hp__card-icon--indigo {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05));
    color: #6366F1;
  }

  .hp__card-icon--green {
    background: linear-gradient(135deg, rgba(var(--sah-accent-2-rgb), 0.15), rgba(var(--sah-accent-2-rgb), 0.05));
    color: var(--sah-accent-2);
  }

  .hp__card-icon--amber {
    background: linear-gradient(135deg, rgba(var(--sah-accent-1-rgb), 0.15), rgba(var(--sah-accent-1-rgb), 0.05));
    color: var(--sah-accent-1);
  }

  .hp__card-head h3 {
    font-size: 14px !important;
    font-weight: 700 !important;
    color: var(--text-primary);
    margin: 0;
    font-family: var(--font-display);
    letter-spacing: -0.01em;
    flex: 1;
  }

  .hp__card-badge {
    font-size: 10px;
    padding: 3px 10px;
    border-radius: var(--radius-full);
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    color: var(--text-muted);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-family: var(--font-display);
  }

  /* ─── CHART ─── */
  .hp__chart { height: 160px; }
  .hp__chart--sm { height: 120px; }

  .hp__chart-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 100px;
    color: var(--text-muted);
    font-size: 13px;
    font-family: var(--font-display);
  }

  .hp__chart-bars {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: 100%;
  }

  .hp__chart-col {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    cursor: default;
  }

  .hp__chart-bar {
    border-radius: 3px 3px 0 0;
    background: linear-gradient(180deg, var(--sah-accent-1), rgba(var(--sah-accent-1-rgb), 0.4));
    min-height: 2px;
    transition: height var(--duration-slow) var(--ease-fluid);
    opacity: 0.85;
  }

  .hp__chart-bar--green {
    background: linear-gradient(180deg, var(--sah-accent-2), rgba(var(--sah-accent-2-rgb), 0.5));
  }

  .hp__chart-bar--red {
    background: linear-gradient(180deg, rgba(230, 57, 70, 0.9), rgba(230, 57, 70, 0.4));
  }

  /* ─── ROW ─── */
  .hp__row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .hp__row .hp__card { margin-bottom: 0; }

  /* ─── SKELETON ─── */
  .hp__skels {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .hp__skel {
    height: 200px;
    border-radius: 20px;
    background: linear-gradient(90deg, var(--glass-bg) 0%, var(--glass-bg-hover) 50%, var(--glass-bg) 100%);
    background-size: 200%;
    border: 1px solid var(--glass-border);
    animation: hp-shimmer 1.5s infinite;
  }

  @keyframes hp-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ─── ERROR ─── */
  .hp__error {
    display: flex;
    justify-content: center;
    padding: 40px;
  }

  .hp__error-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 40px;
    border-radius: 20px;
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    text-align: center;
    color: var(--text-muted);
  }

  .hp__error-card p {
    color: var(--text-secondary);
    margin: 0;
    font-size: 14px;
    font-family: var(--font-display);
  }

  .hp__retry {
    padding: 8px 24px;
    border-radius: var(--radius-full);
    background: rgba(var(--sah-accent-1-rgb), 0.1);
    border: 1px solid rgba(var(--sah-accent-1-rgb), 0.2);
    color: var(--sah-accent-1);
    cursor: pointer;
    font-weight: 600;
    font-family: var(--font-display);
    transition: all 0.2s;
  }

  .hp__retry:hover {
    background: rgba(var(--sah-accent-1-rgb), 0.15);
  }

  /* ─── RESPONSIVE ─── */
  @media (max-width: 700px) {
    .hp__row {
      grid-template-columns: 1fr;
    }
  }
`;
