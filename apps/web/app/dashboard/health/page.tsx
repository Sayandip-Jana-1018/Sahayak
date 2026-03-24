'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, AlertTriangle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function HealthPage() {
  const { data, isLoading, error, refetch } = useQuery<{
    activityByDay: Array<{ date: string; commandCount: number }>;
    medicationAdherence: Array<{ date: string; taken: number; missed: number }>;
    intentBreakdown: Array<{ intent: string; count: number; percentage: number }>;
  }>({
    queryKey: ['dashboard-health'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/dashboard/health?days=30`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const INTENT_COLORS = ['#FF6B2C', '#3B28CC', '#2D6A4F', '#FFB703', '#E63946', '#00B4D8'];

  return (
    <div className="health-page">
      <h2 className="health-page__title">Health Overview</h2>
      <p className="health-page__subtitle">30-day activity and medication adherence</p>

      {isLoading ? (
        <div className="health-page__skeletons">
          {[1, 2, 3].map(i => (
            <div key={i} className="health-skeleton" />
          ))}
        </div>
      ) : error ? (
        <div className="health-page__error">
          <AlertTriangle size={24} />
          <p>Failed to load health data</p>
          <button onClick={() => refetch()}>Retry</button>
        </div>
      ) : (
        <>
          {/* Activity Chart */}
          <div className="health-card">
            <h3>Voice Activity (30 days)</h3>
            <div className="health-chart">
              {(data?.activityByDay || []).length === 0 ? (
                <div className="health-chart__empty">
                  <Activity size={20} />
                  <span>No activity data yet</span>
                </div>
              ) : (
                <div className="health-chart__bars">
                  {(data?.activityByDay || []).map((day, i) => {
                    const max = Math.max(...(data?.activityByDay || []).map(d => d.commandCount), 1);
                    return (
                      <div key={i} className="health-chart__bar-wrapper" title={`${day.date}: ${day.commandCount} commands`}>
                        <div className="health-chart__bar" style={{ height: `${(day.commandCount / max) * 100}%` }} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Bottom row: adherence + intent */}
          <div className="health-page__row">
            <div className="health-card">
              <h3>Medication Adherence (14 days)</h3>
              {(data?.medicationAdherence || []).length === 0 ? (
                <div className="health-chart__empty"><span>No medication data yet</span></div>
              ) : (
                <div className="health-chart__bars health-chart__bars--stacked">
                  {(data?.medicationAdherence || []).slice(-14).map((day, i) => {
                    const total = day.taken + day.missed;
                    return (
                      <div key={i} className="health-chart__bar-wrapper" title={`${day.date}: ${day.taken} taken, ${day.missed} missed`}>
                        {total > 0 && (
                          <>
                            <div className="health-chart__bar health-chart__bar--jade" style={{ height: `${(day.taken / total) * 100}%` }} />
                            <div className="health-chart__bar health-chart__bar--rose" style={{ height: `${(day.missed / total) * 100}%` }} />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="health-card">
              <h3>Command Types</h3>
              {(data?.intentBreakdown || []).length === 0 ? (
                <div className="health-chart__empty"><span>No commands yet</span></div>
              ) : (
                <div className="health-intents">
                  {(data?.intentBreakdown || []).map((intent, i) => (
                    <div key={intent.intent} className="health-intent">
                      <div className="health-intent__bar-bg">
                        <div className="health-intent__bar" style={{ width: `${intent.percentage}%`, background: INTENT_COLORS[i % INTENT_COLORS.length] }} />
                      </div>
                      <span className="health-intent__label">{intent.intent}</span>
                      <span className="health-intent__pct">{intent.percentage}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .health-page { max-width: 1000px; }
        .health-page__title { font-size: 22px !important; font-weight: 700 !important; margin-bottom: 4px; color: var(--text-primary); }
        .health-page__subtitle { color: var(--text-secondary); font-size: 14px; margin-bottom: 24px; }

        .health-card { padding: 20px; border-radius: 16px; background: var(--glass-bg); border: 1px solid var(--glass-border); margin-bottom: 16px; }
        .health-card h3 { font-size: 14px !important; font-weight: 600 !important; color: var(--text-secondary); margin: 0 0 16px; }

        .health-chart { height: 180px; }
        .health-chart__empty { display: flex; align-items: center; justify-content: center; gap: 8px; height: 100%; color: var(--text-muted); font-size: 14px; }
        .health-chart__bars { display: flex; align-items: flex-end; gap: 3px; height: 100%; }
        .health-chart__bars--stacked { align-items: flex-end; }
        .health-chart__bar-wrapper { flex: 1; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; cursor: default; }
        .health-chart__bar { border-radius: 2px 2px 0 0; background: #FF6B2C; min-height: 2px; transition: height 0.3s; opacity: 0.8; }
        .health-chart__bar--jade { background: #2D6A4F; }
        .health-chart__bar--rose { background: #E63946; }

        .health-page__row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        .health-intents { display: flex; flex-direction: column; gap: 12px; }
        .health-intent { display: flex; align-items: center; gap: 10px; }
        .health-intent__bar-bg { flex: 1; height: 8px; border-radius: 4px; background: rgba(255,255,255,0.06); overflow: hidden; }
        :global(.light) .health-intent__bar-bg { background: rgba(27,42,74,0.06); }
        .health-intent__bar { height: 100%; border-radius: 4px; transition: width 0.5s; }
        .health-intent__label { font-size: 12px; color: var(--text-secondary); min-width: 80px; }
        .health-intent__pct { font-size: 12px; color: var(--text-muted); font-weight: 600; min-width: 32px; text-align: right; }

        .health-page__skeletons { display: flex; flex-direction: column; gap: 16px; }
        .health-skeleton { height: 200px; border-radius: 16px; background: var(--glass-bg); border: 1px solid var(--glass-border); animation: shimmer 1.5s infinite; background-size: 200%; }
        @keyframes shimmer { 0% { background-position: 200%; } 100% { background-position: -200%; } }

        .health-page__error { text-align: center; padding: 60px; color: #E63946; display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .health-page__error button { padding: 8px 20px; border-radius: 10px; background: rgba(230,57,70,0.1); border: 1px solid rgba(230,57,70,0.2); color: #E63946; cursor: pointer; }

        @media (max-width: 700px) { .health-page__row { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
