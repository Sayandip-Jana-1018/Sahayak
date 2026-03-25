'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Battery, RefreshCw } from 'lucide-react';

interface Props {
  lat: number | null;
  lng: number | null;
  address?: string | null;
  updatedAt?: string | null;
  batteryLevel?: number | null;
  elderlyName?: string;
  onRequestLocation?: () => void;
}

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Unknown';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function LocationMapCard({ lat, lng, address, updatedAt, batteryLevel, elderlyName, onRequestLocation }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState(address || '');

  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;

    let cancelled = false;

    (async () => {
      // Dynamic import leaflet (SSR-safe)
      const L = (await import('leaflet')).default;

      // Load leaflet CSS via link tag (avoids TS module resolution error)
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (cancelled || !mapRef.current) return;

      // Destroy existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Detect theme
      const isDark = document.documentElement.classList.contains('dark') ||
        document.documentElement.getAttribute('data-theme') === 'dark' ||
        !document.documentElement.classList.contains('light');

      const tileUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: true,
      });

      L.tileLayer(tileUrl, {
        maxZoom: 19,
      }).addTo(map);

      // Custom pulsing marker
      const accentColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--sah-accent-1')?.trim() || '#FF6B2C';

      const markerIcon = L.divIcon({
        className: 'loc-marker',
        html: `
          <div style="position:relative;width:28px;height:28px;">
            <div style="position:absolute;inset:0;border-radius:50%;background:${accentColor};opacity:0.25;animation:locPulse 2s ease-out infinite;"></div>
            <div style="position:absolute;top:4px;left:4px;width:20px;height:20px;border-radius:50%;background:${accentColor};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker([lat, lng], { icon: markerIcon }).addTo(map);
      mapInstanceRef.current = map;
      setMapReady(true);

      // Reverse geocode if no address provided
      if (!address && lat && lng) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`);
          const data = await res.json();
          if (!cancelled && data?.display_name) {
            // Shorten the address
            const parts = data.display_name.split(',').slice(0, 3);
            setResolvedAddress(parts.join(', '));
          }
        } catch { /* ignore geocode errors */ }
      }
    })();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, address]);

  const hasLocation = lat !== null && lng !== null;

  return (
    <>
      <div className="loc-card">
        <div className="loc-card__head">
          <div className="loc-card__head-left">
            <MapPin size={16} />
            <span className="loc-card__label">Location</span>
          </div>
          {updatedAt && (
            <span className="loc-card__updated">{timeAgo(updatedAt)}</span>
          )}
        </div>

        {hasLocation ? (
          <>
            <div ref={mapRef} className="loc-card__map" />
            {resolvedAddress && (
              <p className="loc-card__address">
                <Navigation size={12} /> {resolvedAddress}
              </p>
            )}
            <div className="loc-card__foot">
              {batteryLevel !== null && batteryLevel !== undefined && (
                <span className={`loc-card__battery ${batteryLevel < 20 ? 'loc-card__battery--low' : ''}`}>
                  <Battery size={13} /> {batteryLevel}%
                </span>
              )}
              {onRequestLocation && (
                <button className="loc-card__refresh" onClick={onRequestLocation}>
                  <RefreshCw size={13} /> Request Live
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="loc-card__empty">
            <MapPin size={28} />
            <p>Location not available</p>
            <span>Connect a device to see {elderlyName || 'their'} location</span>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes locPulse {
          0% { transform: scale(1); opacity: 0.25; }
          100% { transform: scale(2.5); opacity: 0; }
        }

        .loc-card {
          background: var(--glass-bg, rgba(255,255,255,0.04));
          backdrop-filter: blur(24px) saturate(140%);
          border: 1px solid var(--glass-border, rgba(255,255,255,0.08));
          border-radius: 20px;
          overflow: hidden;
          margin-top: 16px;
        }

        .loc-card__head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
        }

        .loc-card__head-left {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-primary);
        }

        .loc-card__label {
          font-size: 14px;
          font-weight: 700;
          font-family: var(--font-display);
        }

        .loc-card__updated {
          font-size: 12px;
          color: var(--text-muted);
        }

        .loc-card__map {
          width: 100%;
          height: 180px;
          background: var(--glass-bg);
        }

        :global(.loc-marker) {
          background: transparent !important;
          border: none !important;
        }

        .loc-card__address {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          font-size: 12px;
          color: var(--text-secondary);
          margin: 0;
          border-top: 1px solid var(--glass-border);
        }

        .loc-card__foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          border-top: 1px solid var(--glass-border);
        }

        .loc-card__battery {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
          color: var(--sah-jade, #00B67A);
        }

        .loc-card__battery--low {
          color: var(--sah-rose, #FF4B8A);
        }

        .loc-card__refresh {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          border-radius: 8px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .loc-card__refresh:hover {
          color: var(--sah-accent-1);
          border-color: var(--sah-accent-1);
          background: rgba(var(--sah-accent-1-rgb), 0.06);
        }

        .loc-card__empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 32px 20px;
          text-align: center;
          color: var(--text-muted);
        }

        .loc-card__empty p {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
          margin: 0;
        }

        .loc-card__empty span {
          font-size: 12px;
        }
      `}</style>
    </>
  );
}
