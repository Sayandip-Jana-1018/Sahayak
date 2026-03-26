'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { AlertTriangle, Clock, CheckCircle, Mic, Smartphone, Timer, ShieldCheck } from 'lucide-react';
import { apiRequest, useApiClient } from '@/lib/api';
import { useToastStore } from '@/store/toastStore';

interface SOSEvent {
  id: string;
  triggeredAt: string;
  triggerType: string;
  severity: string;
  locationLat: string | null;
  locationLng: string | null;
  resolvedAt: string | null;
  resolvedByUserId: string | null;
  responseTimeMs: number | null;
  smsCount: number | null;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const TRIGGER_ICONS: Record<string, typeof Mic> = {
  voice: Mic,
  shake: Smartphone,
  inactivity: Timer,
  fall: AlertTriangle,
};

export default function SOSPage() {
  const { getToken } = useAuth();
  const api = useApiClient();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const { data, isLoading, error, refetch } = useQuery<{
    events: SOSEvent[];
    total: number;
  }>({
    queryKey: ['sos-events'],
    queryFn: () => apiRequest('/api/sos-events?page=1&limit=20', getToken),
  });

  const handleResolve = async (id: string) => {
    try {
      await api.put(`/api/sos-events/${id}/resolve`);
      addToast('SOS event resolved ✓', 'success');
      queryClient.invalidateQueries({ queryKey: ['sos-events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
    } catch {
      addToast('Failed to resolve SOS event', 'error');
    }
  };

  const events = data?.events || [];
  const totalAll = data?.total || 0;
  const avgResponse = events.filter(e => e.responseTimeMs).length > 0
    ? Math.round(events.filter(e => e.responseTimeMs).reduce((s, e) => s + (e.responseTimeMs || 0), 0) / events.filter(e => e.responseTimeMs).length / 1000)
    : 0;
  const lastEvent = events[0]?.triggeredAt || null;

  return (
    <div className="sp">
      <div className="sp__head">
        <h2 className="sp__title">SOS History</h2>
        <p className="sp__sub">Emergency events and response times</p>
      </div>

      {/* Stats Row */}
      <div className="sp__stats">
        <div className="sp__stat">
          <span className="sp__stat-val">{totalAll}</span>
          <span className="sp__stat-label">Total Events</span>
        </div>
        <div className="sp__stat">
          <span className="sp__stat-val">{avgResponse > 0 ? `${avgResponse}s` : '—'}</span>
          <span className="sp__stat-label">Avg Response</span>
        </div>
        <div className="sp__stat">
          <span className="sp__stat-val">{lastEvent ? relativeTime(lastEvent) : 'None'}</span>
          <span className="sp__stat-label">Last Event</span>
        </div>
      </div>

      {/* Events */}
      {isLoading ? (
        <div className="sp__skels">
          {[1, 2].map(i => <div key={i} className="sp__skel" />)}
        </div>
      ) : error ? (
        <div className="sp__error">
          <AlertTriangle size={28} />
          <p>Failed to load SOS events</p>
          <button onClick={() => refetch()}>Retry</button>
        </div>
      ) : events.length === 0 ? (
        <div className="sp__empty">
          <div className="sp__empty-icon"><ShieldCheck size={32} strokeWidth={1.5} /></div>
          <p>No SOS events recorded</p>
          <span>This is a good thing! Emergency events will appear here.</span>
        </div>
      ) : (
        <div className="sp__list">
          {events.map((evt) => {
            const TrigIcon = TRIGGER_ICONS[evt.triggerType] || AlertTriangle;
            const resolved = !!evt.resolvedAt;
            return (
              <div key={evt.id} className="sp__event">
                <div className="sp__event-left">
                  <div className={`sp__event-icon sp__event-icon--${evt.severity}`}>
                    <TrigIcon size={18} />
                  </div>
                  <div className="sp__event-info">
                    <span className="sp__event-type">
                      {evt.triggerType.charAt(0).toUpperCase() + evt.triggerType.slice(1)} trigger
                    </span>
                    <span className="sp__event-time">
                      <Clock size={12} /> {relativeTime(evt.triggeredAt)}
                    </span>
                  </div>
                </div>
                <div className="sp__event-right">
                  <span className={`sp__event-badge sp__event-badge--${evt.severity}`}>
                    {evt.severity}
                  </span>
                  {resolved ? (
                    <span className="sp__event-resolved"><CheckCircle size={14} /> Resolved</span>
                  ) : (
                    <button className="sp__event-resolve" onClick={() => handleResolve(evt.id)}>
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`${sosStyles}`}</style>
    </div>
  );
}

const sosStyles = `
  .sp__head { margin-bottom: 20px; text-align: center; }

  .sp__title {
    font-size: clamp(20px, 3vw, 26px) !important;
    font-weight: 800 !important;
    color: var(--text-primary);
    margin: 0;
    font-family: var(--font-display);
    letter-spacing: -0.03em;
  }

  .sp__sub {
    font-size: 13px;
    color: var(--text-muted);
    margin: 2px 0 0;
    font-family: var(--font-display);
  }

  /* ─── STATS ─── */
  .sp__stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-bottom: 20px;
  }

  .sp__stat {
    padding: 20px;
    border-radius: var(--radius-lg);
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .sp__stat-val {
    font-size: 22px;
    font-weight: 800;
    color: var(--text-primary);
    font-family: var(--font-display);
    letter-spacing: -0.02em;
  }

  .sp__stat-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-family: var(--font-display);
  }

  /* ─── EVENT LIST ─── */
  .sp__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .sp__event {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-radius: var(--radius-lg);
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    transition: all var(--duration-normal) var(--ease-fluid);
    gap: 12px;
  }

  .sp__event:hover {
    border-color: var(--glass-border-hover);
  }

  .sp__event-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }

  .sp__event-icon {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .sp__event-icon--critical,
  .sp__event-icon--high {
    background: linear-gradient(135deg, rgba(230, 57, 70, 0.15), rgba(230, 57, 70, 0.05));
    color: #E63946;
  }

  .sp__event-icon--medium {
    background: linear-gradient(135deg, rgba(var(--sah-accent-1-rgb), 0.15), rgba(var(--sah-accent-1-rgb), 0.05));
    color: var(--sah-accent-1);
  }

  .sp__event-icon--low {
    background: linear-gradient(135deg, rgba(var(--sah-accent-2-rgb), 0.15), rgba(var(--sah-accent-2-rgb), 0.05));
    color: var(--sah-accent-2);
  }

  .sp__event-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .sp__event-type {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    font-family: var(--font-display);
  }

  .sp__event-time {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--text-muted);
    font-family: var(--font-display);
  }

  .sp__event-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .sp__event-badge {
    font-size: 10px;
    padding: 3px 10px;
    border-radius: var(--radius-full);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-family: var(--font-display);
  }

  .sp__event-badge--critical,
  .sp__event-badge--high {
    background: rgba(230, 57, 70, 0.12);
    color: #E63946;
  }

  .sp__event-badge--medium {
    background: rgba(var(--sah-accent-1-rgb), 0.12);
    color: var(--sah-accent-1);
  }

  .sp__event-badge--low {
    background: rgba(var(--sah-accent-2-rgb), 0.12);
    color: var(--sah-accent-2);
  }

  .sp__event-resolved {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--sah-accent-2);
    font-weight: 600;
    font-family: var(--font-display);
  }

  .sp__event-resolve {
    padding: 6px 16px;
    border-radius: var(--radius-full);
    background: linear-gradient(135deg, var(--sah-accent-1), var(--sah-accent-2));
    color: #fff;
    border: none;
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
    font-family: var(--font-display);
    transition: all var(--duration-fast) var(--ease-fluid);
  }

  .sp__event-resolve:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(var(--sah-accent-1-rgb), 0.25);
  }

  /* ─── EMPTY ─── */
  .sp__empty {
    text-align: center;
    padding: 60px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: var(--text-muted);
  }

  .sp__empty-icon {
    width: 64px;
    height: 64px;
    border-radius: var(--radius-lg);
    background: rgba(var(--sah-accent-2-rgb), 0.1);
    color: var(--sah-accent-2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
  }

  .sp__empty p {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-secondary);
    margin: 0;
    font-family: var(--font-display);
  }

  .sp__empty span {
    font-size: 13px;
    max-width: 280px;
  }

  /* ─── SKELETON ─── */
  .sp__skels { display: flex; flex-direction: column; gap: 10px; }
  .sp__skel {
    height: 72px;
    border-radius: var(--radius-lg);
    background: linear-gradient(90deg, var(--glass-bg) 0%, var(--glass-bg-hover) 50%, var(--glass-bg) 100%);
    background-size: 200%;
    animation: sp-shimmer 1.5s infinite;
    border: 1px solid var(--glass-border);
  }
  @keyframes sp-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  /* ─── ERROR ─── */
  .sp__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 60px;
    text-align: center;
    color: #E63946;
  }

  .sp__error p { color: var(--text-secondary); margin: 0; }

  .sp__error button {
    padding: 8px 24px;
    border-radius: var(--radius-full);
    background: rgba(230, 57, 70, 0.1);
    border: 1px solid rgba(230, 57, 70, 0.2);
    color: #E63946;
    cursor: pointer;
    font-weight: 600;
    font-family: var(--font-display);
  }

  /* ─── RESPONSIVE ─── */
  @media (max-width: 600px) {
    .sp__stats {
      grid-template-columns: 1fr;
    }

    .sp__event {
      flex-direction: column;
      align-items: flex-start;
    }

    .sp__event-right {
      margin-top: 8px;
    }
  }
`;
