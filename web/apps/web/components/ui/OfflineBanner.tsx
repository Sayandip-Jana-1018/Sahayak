'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [showReconnect, setShowReconnect] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnect(true);
      setTimeout(() => setShowReconnect(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnect(false);
    };

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnect) return null;

  return (
    <>
      <div className={`offline-banner ${showReconnect ? 'offline-banner--online' : ''}`}>
        {showReconnect ? (
          <><Wifi size={16} /> Back online</>
        ) : (
          <><WifiOff size={16} /> You&apos;re offline — some features may be limited</>
        )}
      </div>
      <style jsx>{`
        .offline-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          background: rgba(245, 158, 11, 0.92);
          backdrop-filter: blur(12px);
          animation: offBannerSlide 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .offline-banner--online {
          background: rgba(0, 182, 122, 0.92);
          animation: offBannerSlide 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes offBannerSlide {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
