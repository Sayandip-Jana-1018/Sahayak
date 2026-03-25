'use client';

import { useState, useEffect, useRef } from 'react';
import { Smartphone, Send, Check, MessageCircle, Wifi, Loader2 } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useUser, useAuth } from '@clerk/nextjs';
import { apiRequest } from '@/lib/api';

export function Step4InstallApp() {
  const { formData, updateFormData, nextStep } = useOnboardingStore();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [smsSent, setSmsSent] = useState(false);
  const [smsSending, setSmsSending] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState<'waiting' | 'connected'>('waiting');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const installUrl = `https://sahayak.app/install?ref=${user?.id || 'unknown'}&lang=${formData.primaryLanguage}&name=${encodeURIComponent(formData.elderlyName)}`;

  // Device polling — check every 5s if the elder's device registered
  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const data = await apiRequest<{ registered: boolean }>('/api/device/status?check=latest', getToken);
        if (!cancelled && data?.registered) {
          setDeviceStatus('connected');
          if (pollRef.current) clearInterval(pollRef.current);
          // Auto-advance after brief visual feedback
          setTimeout(() => {
            if (!cancelled) {
              updateFormData({ appInstalled: true });
              nextStep();
            }
          }, 1500);
        }
      } catch { /* ignore polling errors */ }
    };

    pollRef.current = setInterval(poll, 5000);
    poll(); // immediate first check

    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [getToken, updateFormData, nextStep]);

  const handleSendSMS = async () => {
    if (!formData.emergencyContactPhone) return;
    setSmsSending(true);
    try {
      await apiRequest('/api/sms/send-install-link', getToken, {
        method: 'POST',
        body: {
          phone: formData.emergencyContactPhone,
          recipientName: formData.elderlyName,
          language: formData.primaryLanguage,
        },
      });
      setSmsSent(true);
    } catch {
      // silently handle — SMS is optional
    } finally {
      setSmsSending(false);
    }
  };

  return (
    <div className="step4">
      <h2 className="step4__title">
        {formData.userType === 'self' ? 'Install Sahayak on your phone' : 'Install Sahayak on their phone'}
      </h2>
      <p className="step4__subtitle">
        {formData.userType === 'self' 
          ? 'Scan this QR code with your phone camera' 
          : `Scan this QR code with ${formData.elderlyName || "their"}'s phone camera`}
      </p>

      <div className="step4__content-wrapper">
        {/* QR Code Section */}
        <div className="step4__qr-section">
          <div className="step4__qr-frame">
            <div className="step4__qr-bg-glow" />
            <div className="step4__qr-inner">
              <QRCode
                value={installUrl}
                size={180}
                level="M"
              />
            </div>
          </div>
          <p className="step4__qr-hint">Point the phone camera at this code</p>
        </div>

        <div className="step4__divider">
          <span>OR</span>
        </div>

        {/* SMS Fallback */}
        <div className="step4__sms">
          <div className="step4__sms-header">
            <MessageCircle size={16} />
            <span>Send install link via SMS</span>
          </div>

          <div className="step4__sms-row">
            <div className="step4__sms-phone">
              <span className="step4__sms-prefix">+91</span>
              <span>{formData.emergencyContactPhone || '—'}</span>
            </div>

            {smsSent ? (
              <button className="step4__sms-btn step4__sms-btn--sent" disabled>
                <Check size={16} />
                Sent
              </button>
            ) : (
              <button
                className="step4__sms-btn"
                onClick={handleSendSMS}
                disabled={smsSending || !formData.emergencyContactPhone}
              >
                {smsSending ? (
                  <span className="step4__spinner" />
                ) : (
                  <Send size={14} />
                )}
                {smsSending ? 'Sending...' : 'Send SMS'}
              </button>
            )}
          </div>
        </div>

        {/* Device Status Polling */}
        <div className="step4__device-status">
          <div className={`step4__status-dot step4__status-dot--${deviceStatus}`} />
          <span className="step4__status-text">
            {deviceStatus === 'connected' ? (
              <><Check size={14} /> Device connected!</>
            ) : (
              <><Loader2 size={14} className="step4__status-spin" /> Waiting for device...</>
            )}
          </span>
        </div>
      </div>

      {/* Skip */}
      <div className="step4__skip-wrapper">
        <button
          className="step4__skip"
          onClick={() => {
            updateFormData({ appInstalled: false });
            nextStep();
          }}
        >
          They already have it installed — skip this step
        </button>
      </div>

      <style jsx>{`
        .step4 {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
        }

        .step4__title {
          font-family: var(--font-display);
          font-size: 32px !important;
          font-weight: 800 !important;
          letter-spacing: -0.02em;
          margin-bottom: 12px;
          color: var(--text-primary);
        }

        .step4__subtitle {
          color: var(--text-secondary);
          font-size: 15px;
          margin-bottom: 40px;
        }

        .step4__content-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          width: 100%;
          max-width: 480px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
        }

        :global(.light) .step4__content-wrapper,
        :global([data-theme="light"]) .step4__content-wrapper {
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(27, 42, 74, 0.08);
          box-shadow: 0 16px 40px rgba(27, 42, 74, 0.05);
        }

        .step4__qr-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .step4__qr-frame {
          position: relative;
          padding: 24px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 1);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .step4__qr-frame:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.2);
        }

        .step4__qr-bg-glow {
          position: absolute;
          inset: -4px;
          border-radius: 24px;
          background: linear-gradient(135deg, #FF6B2C, #FFD166, #E63946);
          filter: blur(12px);
          opacity: 0.6;
          z-index: -1;
          transition: opacity 0.3s;
        }

        .step4__qr-frame:hover .step4__qr-bg-glow {
          opacity: 0.8;
          filter: blur(16px);
        }

        .step4__qr-inner {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .step4__qr-inner :global(svg) {
          border-radius: 8px;
        }

        .step4__qr-hint {
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .step4__divider {
          display: flex;
          align-items: center;
          width: 80%;
          gap: 16px;
          color: var(--text-muted);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
        }

        .step4__divider::before,
        .step4__divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
        }

        :global(.light) .step4__divider::before,
        :global([data-theme="light"]) .step4__divider::before,
        :global(.light) .step4__divider::after,
        :global([data-theme="light"]) .step4__divider::after {
          background: rgba(27, 42, 74, 0.1);
        }

        .step4__sms {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          gap: 12px;
        }

        .step4__sms-header {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
          color: var(--text-secondary);
          font-size: 14px;
        }

        .step4__sms-row {
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: center;
          width: 100%;
        }

        .step4__sms-phone {
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 15px;
          font-family: var(--font-body);
          color: var(--text-primary);
          display: flex;
          gap: 6px;
          align-items: center;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
          flex: 1;
          justify-content: center;
        }

        :global(.light) .step4__sms-phone,
        :global([data-theme="light"]) .step4__sms-phone {
          background: rgba(0,0,0,0.02);
          border-color: rgba(27,42,74,0.1);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }

        .step4__sms-prefix {
          color: var(--text-muted);
          font-weight: 600;
        }

        .step4__sms-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 12px;
          background: linear-gradient(135deg, #FF6B2C, #FF8F5E);
          color: white;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          font-family: var(--font-body);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          flex: 1;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(255, 107, 44, 0.2);
        }

        .step4__sms-btn:hover:not(:disabled) {
          box-shadow: 0 8px 24px rgba(255, 107, 44, 0.3);
          transform: translateY(-2px);
        }

        .step4__sms-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          filter: grayscale(0.5);
        }

        .step4__sms-btn--sent {
          background: #2D6A4F !important;
          box-shadow: 0 4px 12px rgba(45, 106, 79, 0.2) !important;
        }

        .step4__spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .step4__skip-wrapper {
          margin-top: 32px;
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .step4__skip {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--text-muted);
          font-size: 13px;
          cursor: pointer;
          font-family: var(--font-body);
          padding: 10px 24px;
          border-radius: 12px;
          transition: all 0.2s;
        }

        :global(.light) .step4__skip,
        :global([data-theme="light"]) .step4__skip {
          background: rgba(27,42,74,0.04);
          border-color: rgba(27,42,74,0.1);
        }

        .step4__skip:hover {
          color: var(--text-primary);
          background: rgba(255,255,255,0.08);
        }

        :global(.light) .step4__skip:hover,
        :global([data-theme="light"]) .step4__skip:hover {
          background: rgba(27,42,74,0.08);
        }

        /* Device polling status */
        .step4__device-status {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          border-radius: 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          margin-top: 8px;
          width: 100%;
          justify-content: center;
        }

        :global(.light) .step4__device-status,
        :global([data-theme="light"]) .step4__device-status {
          background: rgba(0,0,0,0.02);
          border-color: rgba(0,0,0,0.06);
        }

        .step4__status-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .step4__status-dot--waiting {
          background: #F59E0B;
          animation: statusPulse 1.5s ease-in-out infinite;
        }

        .step4__status-dot--connected {
          background: #00B67A;
          box-shadow: 0 0 8px rgba(0,182,122,0.5);
        }

        @keyframes statusPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }

        .step4__status-text {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        :global(.step4__status-spin) {
          animation: spin 0.8s linear infinite;
        }
      `}</style>
    </div>
  );
}
