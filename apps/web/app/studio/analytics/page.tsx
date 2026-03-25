'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { BarChart3, Calendar, TrendingUp, Users, Mic } from 'lucide-react';
import { useState } from 'react';
import { apiRequest } from '@/lib/api';

interface AnalyticsData {
  summary: {
    totalCommands: number;
    uniqueUsers: number;
    avgResponseMs: number;
    topLanguage: string;
  };
  daily: Array<{ date: string; commands: number; users: number }>;
  topCommands: Array<{ intent: string; count: number }>;
}

export default function StudioAnalyticsPage() {
  const { getToken } = useAuth();
  const [range, setRange] = useState('7d');

  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['studio-analytics', range],
    queryFn: () => apiRequest<AnalyticsData>(`/api/studio/analytics?range=${range}`, getToken),
  });

  const d = data;
  const summary = d?.summary || { totalCommands: 0, uniqueUsers: 0, avgResponseMs: 0, topLanguage: 'hi' };

  return (
    <div className="sa">
      <div className="sa__head">
        <h2 className="sa__title"><BarChart3 size={22} /> Analytics</h2>
        <p className="sa__sub">Voice command usage and performance metrics</p>
      </div>

      {/* Date Range */}
      <div className="sa__range">
        {['7d', '30d', '90d'].map(r => (
          <button key={r} className={`sa__range-btn ${range === r ? 'sa__range-btn--active' : ''}`}
            onClick={() => setRange(r)}>
            {r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="sa__grid">
        <div className="sa__stat">
          <Mic size={18} className="sa__stat-icon" style={{ color: '#F59E0B' }} />
          <span className="sa__stat-val">{summary.totalCommands.toLocaleString()}</span>
          <span className="sa__stat-label">Total Commands</span>
        </div>
        <div className="sa__stat">
          <Users size={18} className="sa__stat-icon" style={{ color: '#6366F1' }} />
          <span className="sa__stat-val">{summary.uniqueUsers}</span>
          <span className="sa__stat-label">Unique Users</span>
        </div>
        <div className="sa__stat">
          <TrendingUp size={18} className="sa__stat-icon" style={{ color: '#10B981' }} />
          <span className="sa__stat-val">{summary.avgResponseMs}ms</span>
          <span className="sa__stat-label">Avg Response</span>
        </div>
        <div className="sa__stat">
          <Calendar size={18} className="sa__stat-icon" style={{ color: '#EF4444' }} />
          <span className="sa__stat-val">{summary.topLanguage.toUpperCase()}</span>
          <span className="sa__stat-label">Top Language</span>
        </div>
      </div>

      {/* Daily Chart (CSS-only bar chart) */}
      {!isLoading && d?.daily && d.daily.length > 0 && (
        <div className="sa__chart-section">
          <h3 className="sa__section-title">Daily Commands</h3>
          <div className="sa__chart">
            {d.daily.map((day, i) => {
              const max = Math.max(...d.daily.map(x => x.commands), 1);
              const pct = (day.commands / max) * 100;
              return (
                <div key={i} className="sa__bar-col" title={`${day.date}: ${day.commands} commands`}>
                  <div className="sa__bar" style={{ height: `${Math.max(pct, 4)}%` }} />
                  <span className="sa__bar-label">{day.date.slice(-2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Commands */}
      {!isLoading && d?.topCommands && d.topCommands.length > 0 && (
        <div className="sa__top">
          <h3 className="sa__section-title">Top Commands</h3>
          {d.topCommands.slice(0, 8).map((cmd, i) => {
            const max = d.topCommands[0].count || 1;
            const pct = (cmd.count / max) * 100;
            return (
              <div key={i} className="sa__top-item">
                <span className="sa__top-rank">#{i + 1}</span>
                <div className="sa__top-info">
                  <span className="sa__top-name">{cmd.intent}</span>
                  <div className="sa__top-bar-track">
                    <div className="sa__top-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className="sa__top-count">{cmd.count}</span>
              </div>
            );
          })}
        </div>
      )}

      {isLoading && (
        <div className="sa__loading">
          <div className="sa__skel" style={{ height: 200 }} />
        </div>
      )}

      <style jsx>{`
        .sa { padding: 8px 0; }
        .sa__head { text-align: center; margin-bottom: 20px; }
        .sa__title {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-size: clamp(20px, 3vw, 26px) !important; font-weight: 800 !important;
          color: var(--text-primary); font-family: var(--font-display); margin: 0 0 6px;
        }
        .sa__sub { font-size: 14px; color: var(--text-secondary); margin: 0; }
        .sa__range { display: flex; gap: 8px; justify-content: center; margin-bottom: 20px; }
        .sa__range-btn {
          padding: 8px 16px; border-radius: 10px; background: var(--glass-bg); border: 1px solid var(--glass-border);
          color: var(--text-secondary); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .sa__range-btn:hover { color: var(--text-primary); border-color: var(--glass-border-hover); }
        .sa__range-btn--active {
          background: rgba(var(--sah-accent-1-rgb), 0.08) !important; border-color: var(--sah-accent-1) !important;
          color: var(--sah-accent-1) !important;
        }
        .sa__grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 14px; margin-bottom: 28px;
        }
        .sa__stat {
          display: flex; flex-direction: column; align-items: center; padding: 18px 12px;
          border-radius: 16px; background: var(--glass-bg); border: 1px solid var(--glass-border);
          text-align: center;
        }
        .sa__stat-icon { margin-bottom: 8px; }
        .sa__stat-val { font-size: 24px; font-weight: 800; color: var(--text-primary); font-family: var(--font-display); }
        .sa__stat-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-top: 2px; }
        .sa__section-title {
          font-size: 15px; font-weight: 700; color: var(--text-primary); font-family: var(--font-display);
          margin: 0 0 14px; text-align: center;
        }
        .sa__chart-section { margin-bottom: 28px; }
        .sa__chart {
          display: flex; align-items: flex-end; gap: 4px; height: 120px;
          padding: 12px; border-radius: 16px; background: var(--glass-bg); border: 1px solid var(--glass-border);
        }
        .sa__bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
        .sa__bar {
          width: 100%; max-width: 24px; border-radius: 4px 4px 0 0;
          background: linear-gradient(180deg, var(--sah-accent-1), var(--sah-accent-2));
          transition: height 0.3s ease;
        }
        .sa__bar-label { font-size: 9px; color: var(--text-muted); margin-top: 4px; }
        .sa__top { margin-bottom: 20px; }
        .sa__top-item {
          display: flex; align-items: center; gap: 10px; padding: 10px 14px;
          border-radius: 10px; margin-bottom: 6px; transition: background 0.2s;
        }
        .sa__top-item:hover { background: var(--glass-bg); }
        .sa__top-rank { font-size: 12px; font-weight: 700; color: var(--text-muted); width: 24px; }
        .sa__top-info { flex: 1; }
        .sa__top-name { font-size: 13px; font-weight: 600; color: var(--text-primary); display: block; margin-bottom: 4px; }
        .sa__top-bar-track { height: 4px; border-radius: 2px; background: var(--glass-bg); }
        .sa__top-bar-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, var(--sah-accent-1), var(--sah-accent-2)); }
        .sa__top-count { font-size: 13px; font-weight: 700; color: var(--text-secondary); }
        .sa__skel { border-radius: 16px; background: var(--glass-bg); animation: skelPulse 1.5s ease infinite; }
        @keyframes skelPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.2; } }
        @media (max-width: 500px) { .sa__grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  );
}
