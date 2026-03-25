'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { Smartphone, Users, Mic, TrendingUp, ArrowRight, Activity, Shield } from 'lucide-react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';

interface StudioOverview {
  orgName: string;
  stats: {
    totalDevices: number;
    activeDevices: number;
    totalElders: number;
    voiceCommandsToday: number;
  };
  recentAlerts: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
  }>;
}

export default function StudioOverviewPage() {
  const { getToken } = useAuth();
  const { data, isLoading } = useQuery<StudioOverview>({
    queryKey: ['studio-overview'],
    queryFn: () => apiRequest<StudioOverview>('/api/studio/overview', getToken),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="stu">
        <div className="stu__grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stu__skel" />
          ))}
        </div>
        <style jsx>{`${studioStyles}`}</style>
      </div>
    );
  }

  const d = data;
  const stats = d?.stats || { totalDevices: 0, activeDevices: 0, totalElders: 0, voiceCommandsToday: 0 };

  return (
    <div className="stu">
      <div className="stu__hero">
        <h1 className="stu__hero-h1">
          <Shield size={28} /> Studio
        </h1>
        <p className="stu__hero-sub">{d?.orgName || 'Your Organization'} — Management Console</p>
      </div>

      {/* Stat Cards */}
      <div className="stu__grid">
        <Link href="/studio/devices" className="stu__card stu__card--devices">
          <div className="stu__card-shine" />
          <div className="stu__card-icon"><Smartphone size={22} /></div>
          <span className="stu__card-label">Devices</span>
          <span className="stu__card-value">{stats.activeDevices}/{stats.totalDevices}</span>
          <span className="stu__card-sub">active</span>
        </Link>

        <div className="stu__card stu__card--elders">
          <div className="stu__card-shine" />
          <div className="stu__card-icon"><Users size={22} /></div>
          <span className="stu__card-label">Elders</span>
          <span className="stu__card-value">{stats.totalElders}</span>
          <span className="stu__card-sub">enrolled</span>
        </div>

        <Link href="/studio/flows" className="stu__card stu__card--voice">
          <div className="stu__card-shine" />
          <div className="stu__card-icon"><Mic size={22} /></div>
          <span className="stu__card-label">Voice Commands</span>
          <span className="stu__card-value">{stats.voiceCommandsToday}</span>
          <span className="stu__card-sub">today</span>
        </Link>

        <Link href="/studio/analytics" className="stu__card stu__card--analytics">
          <div className="stu__card-shine" />
          <div className="stu__card-icon"><TrendingUp size={22} /></div>
          <span className="stu__card-label">Analytics</span>
          <span className="stu__card-value"><ArrowRight size={18} /></span>
          <span className="stu__card-sub">view reports</span>
        </Link>
      </div>

      {/* Quick Links */}
      <div className="stu__quick">
        <h3 className="stu__section-title">Quick Actions</h3>
        <div className="stu__quick-grid">
          <Link href="/studio/devices" className="stu__quick-btn">
            <Smartphone size={16} /> Manage Devices
          </Link>
          <Link href="/studio/flows" className="stu__quick-btn">
            <Mic size={16} /> Edit Voice Flows
          </Link>
          <Link href="/studio/content" className="stu__quick-btn">
            <Activity size={16} /> Content Library
          </Link>
        </div>
      </div>

      {/* Recent Alerts */}
      {d?.recentAlerts && d.recentAlerts.length > 0 && (
        <div className="stu__alerts">
          <h3 className="stu__section-title">Recent Alerts</h3>
          {d.recentAlerts.slice(0, 5).map((a) => (
            <div key={a.id} className="stu__alert-item">
              <span className={`stu__alert-dot stu__alert-dot--${a.type}`} />
              <div className="stu__alert-body">
                <span className="stu__alert-msg">{a.message}</span>
                <span className="stu__alert-time">{new Date(a.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`${studioStyles}`}</style>
    </div>
  );
}

const studioStyles = `
  .stu { padding: 8px 0; }

  .stu__hero {
    text-align: center;
    margin-bottom: 28px;
  }

  .stu__hero-h1 {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: clamp(22px, 3vw, 30px) !important;
    font-weight: 800 !important;
    color: var(--text-primary);
    font-family: var(--font-display);
    margin: 0 0 6px;
  }

  .stu__hero-sub {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0;
  }

  .stu__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 14px;
    margin-bottom: 28px;
  }

  .stu__card {
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 22px 14px 18px;
    border-radius: 18px;
    background: var(--glass-bg, rgba(255,255,255,0.04));
    backdrop-filter: blur(24px) saturate(140%);
    border: 1px solid var(--glass-border, rgba(255,255,255,0.08));
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    cursor: pointer;
  }

  .stu__card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
  }

  .stu__card-shine {
    position: absolute;
    top: 0;
    left: -50%;
    width: 200%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent);
    transform: skewX(-15deg);
    pointer-events: none;
  }

  .stu__card--devices .stu__card-icon { color: #10B981; }
  .stu__card--elders .stu__card-icon { color: #6366F1; }
  .stu__card--voice .stu__card-icon { color: #F59E0B; }
  .stu__card--analytics .stu__card-icon { color: #EF4444; }

  .stu__card-icon {
    margin-bottom: 10px;
  }

  .stu__card-label {
    font-size: 12px;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 4px;
  }

  .stu__card-value {
    font-size: 28px;
    font-weight: 800;
    color: var(--text-primary);
    font-family: var(--font-display);
    line-height: 1;
  }

  .stu__card-sub {
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 2px;
  }

  .stu__skel {
    height: 130px;
    border-radius: 18px;
    background: var(--glass-bg);
    animation: skelPulse 1.5s ease infinite;
  }

  @keyframes skelPulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.2; }
  }

  .stu__section-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
    font-family: var(--font-display);
    margin: 0 0 14px;
    text-align: center;
  }

  .stu__quick {
    margin-bottom: 28px;
  }

  .stu__quick-grid {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .stu__quick-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 11px 20px;
    border-radius: 12px;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .stu__quick-btn:hover {
    color: var(--text-primary);
    background: var(--glass-bg-hover);
    border-color: var(--glass-border-hover);
    transform: translateY(-2px);
  }

  .stu__alerts {
    margin-bottom: 20px;
  }

  .stu__alert-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 12px;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    margin-bottom: 8px;
  }

  .stu__alert-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    margin-top: 5px;
    flex-shrink: 0;
  }

  .stu__alert-dot--sos { background: var(--sah-rose, #FF4B8A); }
  .stu__alert-dot--device { background: #F59E0B; }
  .stu__alert-dot--general { background: var(--text-muted); }

  .stu__alert-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stu__alert-msg {
    font-size: 13px;
    color: var(--text-primary);
    line-height: 1.3;
  }

  .stu__alert-time {
    font-size: 11px;
    color: var(--text-muted);
  }

  @media (max-width: 500px) {
    .stu__grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`;
