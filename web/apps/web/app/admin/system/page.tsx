'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { Server, Wifi, Database, Cpu, HardDrive, RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/api';

interface SystemHealth {
  services: Array<{ name: string; status: 'healthy' | 'degraded' | 'down'; latencyMs: number; uptime: string }>;
  memory: { used: number; total: number };
  cpu: number;
}

export default function AdminSystemPage() {
  const { getToken } = useAuth();
  const { data, isLoading, refetch } = useQuery<SystemHealth>({
    queryKey: ['admin-system'],
    queryFn: () => apiRequest<SystemHealth>('/api/admin/system-health', getToken),
    refetchInterval: 30000,
  });

  const services = data?.services || [];

  const STATUS_COLORS = { healthy: '#00B67A', degraded: '#F59E0B', down: '#EF4444' };
  const SERVICE_ICONS: Record<string, typeof Server> = { api: Server, database: Database, redis: HardDrive, workers: Cpu };

  return (
    <div className="as">
      <div className="as__head">
        <h2 className="as__title"><Server size={22} /> System Health</h2>
        <p className="as__sub">Real-time infrastructure monitoring</p>
      </div>

      <div className="as__toolbar">
        <button className="as__refresh" onClick={() => refetch()}><RefreshCw size={14} /> Refresh</button>
        <span className="as__auto">Auto-refresh: 30s</span>
      </div>

      {isLoading ? (
        <div className="as__grid">{[1,2,3,4].map(i => <div key={i} className="as__skel" />)}</div>
      ) : (
        <>
          <div className="as__grid">
            {services.map(svc => {
              const Icon = SERVICE_ICONS[svc.name.toLowerCase()] || Server;
              const color = STATUS_COLORS[svc.status];
              return (
                <div key={svc.name} className="as__card">
                  <div className="as__card-top">
                    <Icon size={20} style={{ color }} />
                    <span className="as__card-status" style={{ color, background: `${color}15` }}>{svc.status}</span>
                  </div>
                  <h3 className="as__card-name">{svc.name}</h3>
                  <div className="as__card-meta">
                    <span>Latency: {svc.latencyMs}ms</span>
                    <span>Uptime: {svc.uptime}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {data && (
            <div className="as__resources">
              <h3 className="as__section-title">Resources</h3>
              <div className="as__res-grid">
                <div className="as__res-card">
                  <span className="as__res-label">Memory</span>
                  <div className="as__res-bar"><div className="as__res-fill" style={{ width: `${data.memory.total > 0 ? (data.memory.used / data.memory.total) * 100 : 0}%` }} /></div>
                  <span className="as__res-val">{data.memory.used}MB / {data.memory.total}MB</span>
                </div>
                <div className="as__res-card">
                  <span className="as__res-label">CPU</span>
                  <div className="as__res-bar"><div className="as__res-fill as__res-fill--cpu" style={{ width: `${data.cpu}%` }} /></div>
                  <span className="as__res-val">{data.cpu}%</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .as { padding: 8px 0; }
        .as__head { text-align: center; margin-bottom: 20px; }
        .as__title { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: clamp(20px, 3vw, 26px) !important; font-weight: 800 !important; color: var(--text-primary); font-family: var(--font-display); margin: 0 0 6px; }
        .as__sub { font-size: 14px; color: var(--text-secondary); margin: 0; }
        .as__toolbar { display: flex; gap: 10px; justify-content: center; align-items: center; margin-bottom: 20px; }
        .as__refresh { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 10px; background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-secondary); cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s; }
        .as__refresh:hover { color: var(--text-primary); background: var(--glass-bg-hover); }
        .as__auto { font-size: 12px; color: var(--text-muted); }
        .as__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 28px; }
        .as__card { padding: 18px; border-radius: 16px; background: var(--glass-bg); border: 1px solid var(--glass-border); transition: all 0.2s; }
        .as__card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.1); }
        .as__card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .as__card-status { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; }
        .as__card-name { font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px; text-transform: capitalize; }
        .as__card-meta { display: flex; flex-direction: column; gap: 2px; font-size: 12px; color: var(--text-secondary); }
        .as__section-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0 0 14px; text-align: center; }
        .as__resources { margin-bottom: 20px; }
        .as__res-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; }
        .as__res-card { padding: 16px; border-radius: 14px; background: var(--glass-bg); border: 1px solid var(--glass-border); }
        .as__res-label { font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; display: block; margin-bottom: 8px; }
        .as__res-bar { height: 6px; border-radius: 3px; background: var(--glass-bg); overflow: hidden; margin-bottom: 6px; }
        .as__res-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #10B981, #00B67A); transition: width 0.5s; }
        .as__res-fill--cpu { background: linear-gradient(90deg, #6366F1, #8B5CF6); }
        .as__res-val { font-size: 13px; font-weight: 600; color: var(--text-primary); }
        .as__skel { height: 130px; border-radius: 16px; background: var(--glass-bg); animation: skelPulse 1.5s ease infinite; }
        @keyframes skelPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.2; } }
      `}</style>
    </div>
  );
}
