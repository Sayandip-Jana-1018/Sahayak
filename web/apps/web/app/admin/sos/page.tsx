'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { AlertTriangle, Search, Filter, MapPin, Clock, Shield } from 'lucide-react';
import { useState } from 'react';
import { apiRequest } from '@/lib/api';

interface SOSEvent {
  id: string;
  elderlyName: string;
  triggerType: string;
  status: string;
  city: string;
  timestamp: string;
  resolvedAt: string | null;
}

export default function AdminSOSPage() {
  const { getToken } = useAuth();
  const [filter, setFilter] = useState('all');

  const { data, isLoading } = useQuery<{ events: SOSEvent[] }>({
    queryKey: ['admin-sos', filter],
    queryFn: () => apiRequest<{ events: SOSEvent[] }>(`/api/admin/sos-events?status=${filter}`, getToken),
  });

  const events = data?.events || [];
  const STATUS_COLORS: Record<string, string> = { active: '#EF4444', resolved: '#10B981', acknowledged: '#F59E0B' };

  return (
    <div className="aso">
      <div className="aso__head">
        <h2 className="aso__title"><AlertTriangle size={22} /> SOS Events</h2>
        <p className="aso__sub">Platform-wide emergency timeline</p>
      </div>

      <div className="aso__filters">
        {['all', 'active', 'acknowledged', 'resolved'].map(f => (
          <button key={f} className={`aso__filter ${filter === f ? 'aso__filter--active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="aso__list">{[1,2,3].map(i => <div key={i} className="aso__skel" />)}</div>
      ) : events.length === 0 ? (
        <div className="aso__empty"><Shield size={32} /><p>{filter === 'all' ? 'No SOS events recorded' : `No ${filter} events`}</p></div>
      ) : (
        <div className="aso__timeline">
          {events.map(ev => (
            <div key={ev.id} className="aso__event">
              <div className="aso__event-dot" style={{ background: STATUS_COLORS[ev.status] || '#6b7280' }} />
              <div className="aso__event-card">
                <div className="aso__event-top">
                  <span className="aso__event-name">{ev.elderlyName}</span>
                  <span className="aso__event-status" style={{ color: STATUS_COLORS[ev.status], background: `${STATUS_COLORS[ev.status]}15` }}>{ev.status}</span>
                </div>
                <span className="aso__event-trigger">{ev.triggerType}</span>
                <div className="aso__event-meta">
                  {ev.city && <span><MapPin size={12} /> {ev.city}</span>}
                  <span><Clock size={12} /> {new Date(ev.timestamp).toLocaleString()}</span>
                </div>
                {ev.resolvedAt && <span className="aso__event-resolved">Resolved: {new Date(ev.resolvedAt).toLocaleString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .aso { padding: 8px 0; }
        .aso__head { text-align: center; margin-bottom: 20px; }
        .aso__title { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: clamp(20px, 3vw, 26px) !important; font-weight: 800 !important; color: var(--text-primary); font-family: var(--font-display); margin: 0 0 6px; }
        .aso__sub { font-size: 14px; color: var(--text-secondary); margin: 0; }
        .aso__filters { display: flex; gap: 8px; justify-content: center; margin-bottom: 20px; flex-wrap: wrap; }
        .aso__filter { padding: 8px 16px; border-radius: 10px; background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-secondary); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .aso__filter:hover { color: var(--text-primary); }
        .aso__filter--active { background: rgba(239,68,68,0.08) !important; border-color: #EF4444 !important; color: #EF4444 !important; }
        .aso__timeline { position: relative; padding-left: 24px; }
        .aso__timeline::before { content: ''; position: absolute; left: 7px; top: 0; bottom: 0; width: 2px; background: var(--glass-border); }
        .aso__event { position: relative; margin-bottom: 14px; }
        .aso__event-dot { position: absolute; left: -20px; top: 18px; width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--glass-bg); z-index: 1; }
        .aso__event-card { padding: 14px 16px; border-radius: 14px; background: var(--glass-bg); border: 1px solid var(--glass-border); display: flex; flex-direction: column; gap: 6px; transition: all 0.2s; }
        .aso__event-card:hover { background: var(--glass-bg-hover); }
        .aso__event-top { display: flex; justify-content: space-between; align-items: center; }
        .aso__event-name { font-size: 14px; font-weight: 700; color: var(--text-primary); }
        .aso__event-status { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; }
        .aso__event-trigger { font-size: 12px; color: var(--text-secondary); }
        .aso__event-meta { display: flex; gap: 12px; font-size: 11px; color: var(--text-muted); }
        .aso__event-meta span { display: flex; align-items: center; gap: 3px; }
        .aso__event-resolved { font-size: 11px; color: #10B981; }
        .aso__skel { height: 80px; border-radius: 14px; background: var(--glass-bg); animation: skelPulse 1.5s ease infinite; margin-bottom: 10px; }
        @keyframes skelPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.2; } }
        .aso__empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 50px 20px; color: var(--text-muted); }
        .aso__empty p { font-size: 14px; font-weight: 600; color: var(--text-secondary); margin: 0; }
      `}</style>
    </div>
  );
}
