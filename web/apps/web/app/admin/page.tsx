'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { Shield, Users, Building2, Brain, AlertTriangle, Activity, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';

interface AdminOverview {
  stats: { totalUsers: number; totalOrgs: number; totalAiCalls: number; activeSos: number; totalElders: number };
  growth: Array<{ date: string; users: number; commands: number }>;
}

export default function AdminOverviewPage() {
  const { getToken } = useAuth();
  const { data, isLoading } = useQuery<AdminOverview>({
    queryKey: ['admin-overview'],
    queryFn: () => apiRequest<AdminOverview>('/api/admin/overview', getToken),
    refetchInterval: 30000,
  });

  const s = data?.stats || { totalUsers: 0, totalOrgs: 0, totalAiCalls: 0, activeSos: 0, totalElders: 0 };

  const STATS = [
    { icon: Users, label: 'Total Users', value: s.totalUsers, color: '#10B981' },
    { icon: Building2, label: 'Organizations', value: s.totalOrgs, color: '#F59E0B' },
    { icon: Brain, label: 'AI Calls (30d)', value: s.totalAiCalls, color: '#8B5CF6' },
    { icon: AlertTriangle, label: 'Active SOS', value: s.activeSos, color: '#EF4444' },
    { icon: Activity, label: 'Elders Enrolled', value: s.totalElders, color: '#6366F1' },
  ];

  return (
    <div className="ao">
      <div className="ao__hero">
        <h1 className="ao__hero-h1"><Shield size={28} /> System Admin</h1>
        <p className="ao__hero-sub">Platform-wide management and monitoring</p>
      </div>

      <div className="ao__grid">
        {isLoading ? [1,2,3,4,5].map(i => <div key={i} className="ao__skel" />) :
          STATS.map((st, i) => (
            <div key={i} className="ao__stat">
              <st.icon size={20} style={{ color: st.color }} />
              <span className="ao__stat-val">{st.value.toLocaleString()}</span>
              <span className="ao__stat-label">{st.label}</span>
            </div>
          ))
        }
      </div>

      {/* Growth Chart */}
      {!isLoading && data?.growth && data.growth.length > 0 && (
        <div className="ao__chart-section">
          <h3 className="ao__section-title"><TrendingUp size={16} /> 30-Day Growth</h3>
          <div className="ao__chart">
            {data.growth.map((d, i) => {
              const max = Math.max(...data.growth.map(x => x.users + x.commands), 1);
              const pct = ((d.users + d.commands) / max) * 100;
              return (
                <div key={i} className="ao__bar-col" title={`${d.date}: ${d.users} users, ${d.commands} commands`}>
                  <div className="ao__bar" style={{ height: `${Math.max(pct, 4)}%` }} />
                  <span className="ao__bar-label">{i % 5 === 0 ? d.date.slice(-5) : ''}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="ao__quick">
        <Link href="/admin/users" className="ao__quick-btn"><Users size={16} /> Manage Users</Link>
        <Link href="/admin/organizations" className="ao__quick-btn"><Building2 size={16} /> Organizations</Link>
        <Link href="/admin/system" className="ao__quick-btn"><Activity size={16} /> System Health</Link>
      </div>

      <style jsx>{`
        .ao { padding: 8px 0; }
        .ao__hero { text-align: center; margin-bottom: 24px; }
        .ao__hero-h1 {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          font-size: clamp(22px, 3vw, 30px) !important; font-weight: 800 !important;
          color: var(--text-primary); font-family: var(--font-display); margin: 0 0 6px;
        }
        .ao__hero-sub { font-size: 14px; color: var(--text-secondary); margin: 0; }
        .ao__grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 14px; margin-bottom: 28px;
        }
        .ao__stat {
          display: flex; flex-direction: column; align-items: center; padding: 20px 12px;
          border-radius: 18px; background: var(--glass-bg); border: 1px solid var(--glass-border);
          text-align: center; transition: all 0.2s;
        }
        .ao__stat:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(0,0,0,0.1); }
        .ao__stat-val { font-size: 28px; font-weight: 800; color: var(--text-primary); font-family: var(--font-display); margin: 8px 0 2px; }
        .ao__stat-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
        .ao__skel { height: 120px; border-radius: 18px; background: var(--glass-bg); animation: skelPulse 1.5s ease infinite; }
        @keyframes skelPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.2; } }
        .ao__section-title {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0 0 14px;
        }
        .ao__chart-section { margin-bottom: 28px; }
        .ao__chart {
          display: flex; align-items: flex-end; gap: 2px; height: 140px;
          padding: 12px; border-radius: 16px; background: var(--glass-bg); border: 1px solid var(--glass-border);
        }
        .ao__bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
        .ao__bar {
          width: 100%; max-width: 16px; border-radius: 3px 3px 0 0;
          background: linear-gradient(180deg, #EF4444, #F97316); transition: height 0.3s;
        }
        .ao__bar-label { font-size: 8px; color: var(--text-muted); margin-top: 3px; min-height: 10px; }
        .ao__quick { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .ao__quick-btn {
          display: flex; align-items: center; gap: 8px; padding: 11px 20px; border-radius: 12px;
          background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-secondary);
          font-size: 13px; font-weight: 600; text-decoration: none; transition: all 0.2s;
        }
        .ao__quick-btn:hover { color: var(--text-primary); background: var(--glass-bg-hover); transform: translateY(-2px); }
        @media (max-width: 500px) { .ao__grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  );
}
