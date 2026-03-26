'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Phone, X } from 'lucide-react';
import { useSOSModalStore } from '@/store/sosModalStore';

export function SOSModal() {
  const { visible, data, dismissSOS } = useSOSModalStore();
  const [showDismiss, setShowDismiss] = useState(false);

  // Show dismiss button after 5 seconds
  useEffect(() => {
    if (!visible) { setShowDismiss(false); return; }
    const timer = setTimeout(() => setShowDismiss(true), 5000);
    return () => clearTimeout(timer);
  }, [visible]);

  // Play alert sound
  useEffect(() => {
    if (!visible) return;
    let howl: any = null;
    try {
      const { Howl } = require('howler');
      howl = new Howl({ src: ['/sounds/alert.mp3'], loop: true, volume: 0.8 });
      howl.play();
    } catch { /* howler not available */ }
    return () => { howl?.stop(); };
  }, [visible]);

  if (!visible || !data) return null;

  return (
    <>
      <div className="sos-modal-overlay" role="alertdialog" aria-modal="true" aria-label="Emergency SOS Alert">
        <div className="sos-modal">
          <div className="sos-modal__pulse-ring" />
          <div className="sos-modal__pulse-ring sos-modal__pulse-ring--2" />

          <div className="sos-modal__icon">
            <AlertTriangle size={56} strokeWidth={2.5} />
          </div>

          <h1 className="sos-modal__title">SOS ALERT</h1>

          <p className="sos-modal__trigger">
            {data.triggerType === 'voice' && '🎤 Voice SOS triggered'}
            {data.triggerType === 'shake' && '📱 Phone shake detected'}
            {data.triggerType === 'inactivity' && '⏰ Prolonged inactivity'}
            {data.triggerType === 'fall' && '⚠️ Fall detected'}
            {!['voice','shake','inactivity','fall'].includes(data.triggerType) && `⚠️ ${data.triggerType}`}
          </p>

          <p className="sos-modal__name">{data.elderlyName}</p>

          {data.location && (
            <a
              className="sos-modal__location"
              href={`https://maps.google.com/?q=${data.location.lat},${data.location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              📍 View Location on Maps
            </a>
          )}

          <div className="sos-modal__contacting">
            <Phone size={18} className="sos-modal__phone-icon" />
            <span>Calling emergency contacts...</span>
          </div>

          {data.contactNames && data.contactNames.length > 0 && (
            <div className="sos-modal__contacts">
              {data.contactNames.map((name, i) => (
                <span key={i} className="sos-modal__contact-chip">{name}</span>
              ))}
            </div>
          )}

          {showDismiss && (
            <button className="sos-modal__dismiss" onClick={dismissSOS}>
              <X size={16} /> Dismiss Alert
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .sos-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(180, 20, 30, 0.15);
          animation: sosOverlayPulse 2s ease-in-out infinite;
        }

        @keyframes sosOverlayPulse {
          0%, 100% { background: rgba(180, 20, 30, 0.12); }
          50%       { background: rgba(180, 20, 30, 0.22); }
        }

        .sos-modal {
          position: relative;
          max-width: 480px;
          width: 100%;
          padding: 48px 36px;
          border-radius: 28px;
          background: rgba(10, 8, 16, 0.97);
          border: 2px solid rgba(230, 57, 70, 0.5);
          box-shadow: 0 0 80px rgba(230, 57, 70, 0.25), 0 24px 60px rgba(0,0,0,0.5);
          text-align: center;
          overflow: hidden;
        }

        :global(.light) .sos-modal,
        :global([data-theme="light"]) .sos-modal {
          background: rgba(255, 255, 255, 0.97);
        }

        .sos-modal__pulse-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          border: 2px solid rgba(230, 57, 70, 0.2);
          transform: translate(-50%, -50%);
          animation: sosPulseRing 2s ease-out infinite;
        }

        .sos-modal__pulse-ring--2 {
          animation-delay: 1s;
        }

        @keyframes sosPulseRing {
          0%   { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }

        .sos-modal__icon {
          color: #E63946;
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
          display: inline-flex;
          animation: sosIconBounce 0.8s ease-in-out infinite alternate;
        }

        @keyframes sosIconBounce {
          from { transform: scale(1); }
          to   { transform: scale(1.1); }
        }

        .sos-modal__title {
          font-family: var(--font-accent, 'Syne', sans-serif) !important;
          font-size: 36px !important;
          font-weight: 800 !important;
          color: #E63946;
          margin: 0 0 12px;
          letter-spacing: 0.06em;
          position: relative;
          z-index: 1;
        }

        .sos-modal__trigger {
          font-size: 16px;
          color: var(--text-secondary, rgba(255,255,255,0.7));
          margin: 0 0 8px;
          position: relative;
          z-index: 1;
        }

        .sos-modal__name {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary, #F8F6FF);
          margin: 0 0 20px;
          position: relative;
          z-index: 1;
        }

        .sos-modal__location {
          display: inline-block;
          color: #FF6B2C;
          font-size: 14px;
          font-weight: 600;
          text-decoration: underline;
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
        }

        .sos-modal__contacting {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 15px;
          color: var(--text-secondary);
          margin-bottom: 12px;
          position: relative;
          z-index: 1;
        }

        :global(.sos-modal__phone-icon) {
          animation: phoneRing 0.4s ease-in-out infinite alternate;
        }

        @keyframes phoneRing {
          from { transform: rotate(-10deg); }
          to   { transform: rotate(10deg); }
        }

        .sos-modal__contacts {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          margin-bottom: 24px;
          position: relative;
          z-index: 1;
        }

        .sos-modal__contact-chip {
          padding: 4px 12px;
          border-radius: 8px;
          background: rgba(255, 107, 44, 0.1);
          border: 1px solid rgba(255, 107, 44, 0.2);
          color: #FF6B2C;
          font-size: 13px;
          font-weight: 600;
        }

        .sos-modal__dismiss {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 12px 28px;
          border-radius: 14px;
          background: rgba(230, 57, 70, 0.1);
          border: 1px solid rgba(230, 57, 70, 0.3);
          color: #E63946;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          font-family: var(--font-body);
          transition: all 0.2s;
          position: relative;
          z-index: 1;
          animation: fadeIn 0.3s ease;
        }

        .sos-modal__dismiss:hover {
          background: rgba(230, 57, 70, 0.2);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
