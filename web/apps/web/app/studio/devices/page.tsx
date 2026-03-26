'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { Smartphone, Search, Wifi, WifiOff, Battery, MapPin, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { apiRequest } from '@/lib/api';

interface Device {
  id: string;
  elderlyName: string;
  deviceModel: string;
  lastSeen: string | null;
  batteryLevel: number | null;
  isOnline: boolean;
  city: string;
}

export default function StudioDevicesPage() {
  const { getToken } = useAuth();
  const [search, setSearch] = useState('');
  const { data, isLoading, refetch } = useQuery<{ devices: Device[] }>({
    queryKey: ['studio-devices'],
    queryFn: () => apiRequest<{ devices: Device[] }>('/api/studio/devices', getToken),
  });

  const devices = (data?.devices || []).filter(d =>
    d.elderlyName.toLowerCase().includes(search.toLowerCase()) ||
    d.deviceModel.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="sd">
      <div className="sd__head">
        <h2 className="sd__title"><Smartphone size={22} /> Device Management</h2>
        <p className="sd__sub">Monitor and manage all enrolled devices</p>
      </div>

      <div className="sd__toolbar">
        <div className="sd__search">
          <Search size={16} />
          <input placeholder="Search devices..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="sd__refresh" onClick={() => refetch()}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="sd__grid">{[1,2,3].map(i => <div key={i} className="sd__skel" />)}</div>
      ) : devices.length === 0 ? (
        <div className="sd__empty">
          <Smartphone size={32} />
          <p>No devices found</p>
        </div>
      ) : (
        <div className="sd__grid">
          {devices.map(d => (
            <div key={d.id} className="sd__card">
              <div className="sd__card-top">
                <div className={`sd__status ${d.isOnline ? 'sd__status--on' : 'sd__status--off'}`}>
                  {d.isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                  {d.isOnline ? 'Online' : 'Offline'}
                </div>
                {d.batteryLevel !== null && (
                  <span className={`sd__battery ${d.batteryLevel < 20 ? 'sd__battery--low' : ''}`}>
                    <Battery size={13} /> {d.batteryLevel}%
                  </span>
                )}
              </div>
              <h3 className="sd__card-name">{d.elderlyName}</h3>
              <span className="sd__card-model">{d.deviceModel}</span>
              {d.city && (
                <span className="sd__card-loc"><MapPin size={12} /> {d.city}</span>
              )}
              <span className="sd__card-seen">
                Last seen: {d.lastSeen ? new Date(d.lastSeen).toLocaleString() : 'Never'}
              </span>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .sd { padding: 8px 0; }
        .sd__head { text-align: center; margin-bottom: 20px; }
        .sd__title {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-size: clamp(20px, 3vw, 26px) !important; font-weight: 800 !important;
          color: var(--text-primary); font-family: var(--font-display); margin: 0 0 6px;
        }
        .sd__sub { font-size: 14px; color: var(--text-secondary); margin: 0; }
        .sd__toolbar {
          display: flex; gap: 10px; justify-content: center; margin-bottom: 20px; flex-wrap: wrap;
        }
        .sd__search {
          display: flex; align-items: center; gap: 8px; padding: 10px 16px;
          border-radius: 12px; background: var(--glass-bg); border: 1px solid var(--glass-border);
          color: var(--text-secondary); flex: 1; max-width: 320px;
        }
        .sd__search input {
          flex: 1; background: transparent; border: none; outline: none;
          color: var(--text-primary); font-size: 14px;
        }
        .sd__search input::placeholder { color: var(--text-muted); }
        .sd__refresh {
          display: flex; align-items: center; gap: 6px; padding: 10px 16px;
          border-radius: 12px; background: var(--glass-bg); border: 1px solid var(--glass-border);
          color: var(--text-secondary); cursor: pointer; font-size: 13px; font-weight: 600;
          transition: all 0.2s;
        }
        .sd__refresh:hover { color: var(--text-primary); background: var(--glass-bg-hover); }
        .sd__grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px;
        }
        .sd__card {
          padding: 18px; border-radius: 18px;
          background: var(--glass-bg); backdrop-filter: blur(24px) saturate(140%);
          border: 1px solid var(--glass-border);
          display: flex; flex-direction: column; gap: 6px;
          transition: all 0.2s ease;
        }
        .sd__card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.1); }
        .sd__card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
        .sd__status {
          display: flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 700;
          padding: 4px 10px; border-radius: 8px;
        }
        .sd__status--on { color: #00B67A; background: rgba(0,182,122,0.1); }
        .sd__status--off { color: var(--text-muted); background: var(--glass-bg); }
        .sd__battery { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: #00B67A; }
        .sd__battery--low { color: #FF4B8A; }
        .sd__card-name { font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0; }
        .sd__card-model { font-size: 12px; color: var(--text-secondary); }
        .sd__card-loc { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--text-secondary); }
        .sd__card-seen { font-size: 11px; color: var(--text-muted); }
        .sd__skel { height: 140px; border-radius: 18px; background: var(--glass-bg); animation: skelPulse 1.5s ease infinite; }
        @keyframes skelPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.2; } }
        .sd__empty {
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          padding: 60px 20px; color: var(--text-muted); font-size: 14px;
        }
      `}</style>
    </div>
  );
}
