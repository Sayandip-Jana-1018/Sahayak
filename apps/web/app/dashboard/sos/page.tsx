'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Clock, MapPin, CheckCircle, Mic, Smartphone, Timer, Users } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#E63946',
  high: '#E63946',
  medium: '#FFB703',
  low: '#2D6A4F',
};

export default function SOSPage() {
  const { data, isLoading, error, refetch } = useQuery<{
    events: SOSEvent[];
    total: number;
  }>({
    queryKey: ['sos-events'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/sos-events?page=1&limit=20`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const events = data?.events || [];

  // Compute stats
  const totalAll = data?.total || 0;
  const avgResponse = events.filter(e => e.responseTimeMs).length > 0
    ? Math.round(events.filter(e => e.responseTimeMs).reduce((s, e) => s + (e.responseTimeMs || 0), 0) / events.filter(e => e.responseTimeMs).length / 1000)
    : 0;
  const lastEvent = events[0]?.triggeredAt || null;

  return (
    <div className="sos-page">
      <h2 className="sos-page__title">SOS History</h2>

      {/* Stats row */}
      <div className="sos-page__stats">
        <div className="sos-stat">
          <span className="sos-stat__value">{totalAll}</span>
          <span className="sos-stat__label">Total Events</span>
        </div>
        <div className="sos-stat">
          <span className="sos-stat__value">{avgResponse ? `${avgResponse}s` : '—'}</span>
          <span className="sos-stat__label">Avg Response</span>
        </div>
        <div className="sos-stat">
          <span className="sos-stat__value">{lastEvent ? relativeTime(lastEvent) : 'None'}</span>
          <span className="sos-stat__label">Last Event</span>
        </div>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="sos-page__loading">Loading...</div>
      ) : error ? (
        <div className="sos-page__error">
          <AlertTriangle size={24} />
          <p>Failed to load SOS history</p>
          <button onClick={() => refetch()}>Retry</button>
        </div>
      ) : events.length === 0 ? (
        <div className="sos-page__empty">
          <CheckCircle size={32} />
          <p>No SOS events recorded</p>
          <span>This is a good thing! Emergency events will appear here.</span>
        </div>
      ) : (
        <div className="sos-timeline">
          {events.map((event) => {
            const TriggerIcon = TRIGGER_ICONS[event.triggerType] || AlertTriangle;
            const severityColor = SEVERITY_COLORS[event.severity] || '#E63946';
            const isActive = !event.resolvedAt;

            return (
              <div key={event.id} className={`sos-timeline__card ${isActive ? 'sos-timeline__card--active' : ''}`}>
                <div className="sos-timeline__dot" style={{ background: severityColor }} />

                <div className="sos-timeline__top">
                  <span className="sos-timeline__severity" style={{ background: `${severityColor}15`, color: severityColor, borderColor: `${severityColor}30` }}>
                    {event.severity.toUpperCase()}
                  </span>
                  <span className="sos-timeline__time">{relativeTime(event.triggeredAt)}</span>
                  <span className={`sos-timeline__status ${isActive ? 'sos-timeline__status--active' : 'sos-timeline__status--resolved'}`}>
                    {isActive ? 'Active' : 'Resolved'}
                  </span>
                </div>

                <div className="sos-timeline__trigger">
                  <TriggerIcon size={16} />
                  <span>
                    {event.triggerType === 'voice' && 'Voice SOS triggered'}
                    {event.triggerType === 'shake' && 'Phone shake detected'}
                    {event.triggerType === 'inactivity' && 'No activity detected'}
                    {event.triggerType === 'fall' && 'Fall detected'}
                  </span>
                </div>

                {event.locationLat && event.locationLng && (
                  <div className="sos-timeline__location">
                    <MapPin size={14} />
                    <a href={`https://maps.google.com/?q=${event.locationLat},${event.locationLng}`} target="_blank" rel="noopener">
                      View on Google Maps
                    </a>
                  </div>
                )}

                {event.responseTimeMs && (
                  <div className="sos-timeline__response">
                    <Clock size={14} />
                    <span>Notified in {(event.responseTimeMs / 1000).toFixed(1)}s</span>
                    {event.smsCount && (
                      <>
                        &nbsp;·&nbsp;
                        <Users size={14} />
                        <span>{event.smsCount} contacts</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .sos-page { max-width: 800px; }
        .sos-page__title { font-size: 22px !important; font-weight: 700 !important; margin-bottom: 20px; color: var(--text-primary); }

        .sos-page__stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 28px; }
        .sos-stat { padding: 16px; border-radius: 14px; background: var(--glass-bg); border: 1px solid var(--glass-border); text-align: center; }
        .sos-stat__value { display: block; font-size: 20px; font-weight: 700; color: var(--text-primary); }
        .sos-stat__label { font-size: 12px; color: var(--text-muted); }

        .sos-timeline { position: relative; padding-left: 24px; }
        .sos-timeline::before { content: ''; position: absolute; left: 8px; top: 0; bottom: 0; width: 2px; background: rgba(255,255,255,0.08); }
        :global(.light) .sos-timeline::before { background: rgba(27,42,74,0.08); }

        .sos-timeline__card { position: relative; padding: 16px 20px; border-radius: 14px; background: var(--glass-bg); border: 1px solid var(--glass-border); margin-bottom: 12px; }
        .sos-timeline__card--active { border-color: rgba(230,57,70,0.3); animation: sos-pulse 2s infinite; }
        @keyframes sos-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(230,57,70,0.15); } 50% { box-shadow: 0 0 0 6px rgba(230,57,70,0); } }

        .sos-timeline__dot { position: absolute; left: -20px; top: 20px; width: 12px; height: 12px; border-radius: 50%; }

        .sos-timeline__top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .sos-timeline__severity { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; border: 1px solid; letter-spacing: 0.05em; }
        .sos-timeline__time { font-size: 12px; color: var(--text-muted); flex: 1; }
        .sos-timeline__status { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; }
        .sos-timeline__status--active { background: rgba(230,57,70,0.1); color: #E63946; }
        .sos-timeline__status--resolved { background: rgba(45,106,79,0.1); color: #2D6A4F; }

        .sos-timeline__trigger { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-primary); margin-bottom: 8px; }
        .sos-timeline__location { display: flex; align-items: center; gap: 6px; font-size: 13px; margin-bottom: 6px; }
        .sos-timeline__location a { color: #FF6B2C; text-decoration: underline; }
        .sos-timeline__response { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-secondary); }

        .sos-page__empty { text-align: center; padding: 60px; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .sos-page__empty span { font-size: 13px; }
        .sos-page__loading { padding: 40px; text-align: center; color: var(--text-muted); }
        .sos-page__error { text-align: center; padding: 60px; color: #E63946; display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .sos-page__error button { padding: 8px 20px; border-radius: 10px; background: rgba(230,57,70,0.1); border: 1px solid rgba(230,57,70,0.2); color: #E63946; cursor: pointer; }
      `}</style>
    </div>
  );
}
