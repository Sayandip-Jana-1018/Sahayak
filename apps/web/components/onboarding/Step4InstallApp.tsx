'use client';

import { useState } from 'react';
import { Smartphone, Send, Check, MessageCircle } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useUser } from '@clerk/nextjs';

export function Step4InstallApp() {
  const { formData, updateFormData, nextStep } = useOnboardingStore();
  const { user } = useUser();
  const [smsSent, setSmsSent] = useState(false);
  const [smsSending, setSmsSending] = useState(false);

  const installUrl = `https://sahayak.app/install?ref=${user?.id || 'unknown'}&lang=${formData.primaryLanguage}&name=${encodeURIComponent(formData.elderlyName)}`;

  const handleSendSMS = async () => {
    if (!formData.emergencyContactPhone) return;
    setSmsSending(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/sms/send-install-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.emergencyContactPhone,
          recipientName: formData.elderlyName,
          language: formData.primaryLanguage,
        }),
      });
      if (res.ok) {
        setSmsSent(true);
      }
    } catch {
      // silently handle — SMS is optional
    } finally {
      setSmsSending(false);
    }
  };

  return (
    <div className="step4">
      <h2 className="step4__title">Install Sahayak on their phone</h2>
      <p className="step4__subtitle">
        Scan this QR code with {formData.elderlyName || "their"}'s phone camera
      </p>

      {/* QR Code Card */}
      <div className="step4__qr-card">
        <div className="step4__qr-frame">
          <div className="step4__qr-inner">
            <QRCode
              value={installUrl}
              size={200}
              level="M"
              style={{ borderRadius: 8 }}
            />
          </div>
          <div className="step4__phone-icon">
            <Smartphone size={20} />
          </div>
        </div>
        <p className="step4__qr-hint">Point the phone camera at this code</p>
      </div>

      {/* SMS Fallback */}
      <div className="step4__sms">
        <div className="step4__sms-header">
          <MessageCircle size={16} />
          <span>Or send the install link via SMS</span>
        </div>

        <div className="step4__sms-row">
          <div className="step4__sms-phone">
            <span className="step4__sms-prefix">+91</span>
            <span>{formData.emergencyContactPhone || '—'}</span>
          </div>

          {smsSent ? (
            <button className="step4__sms-btn step4__sms-btn--sent" disabled>
              <Check size={16} />
              SMS Sent ✓
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

      {/* Skip */}
      <button
        className="step4__skip"
        onClick={() => {
          updateFormData({ appInstalled: false });
          nextStep();
        }}
      >
        They already have it installed — skip this step
      </button>

      <style jsx>{`
        .step4 {
          text-align: center;
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
          margin-bottom: 32px;
        }

        .step4__qr-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }

        .step4__qr-frame {
          position: relative;
          padding: 32px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }

        :global(.light) .step4__qr-frame,
        :global([data-theme="light"]) .step4__qr-frame {
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(27, 42, 74, 0.08);
          box-shadow: 0 12px 40px rgba(27, 42, 74, 0.05);
        }

        .step4__qr-frame:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 50px rgba(0, 0, 0, 0.15);
        }

        .step4__qr-inner {
          padding: 16px;
          background: white;
          border-radius: 12px;
        }

        .step4__phone-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255, 107, 44, 0.1);
          color: #FF6B2C;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .step4__qr-hint {
          font-size: 13px;
          color: var(--text-muted);
        }

        .step4__sms {
          padding: 24px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 24px;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
        }

        :global(.light) .step4__sms,
        :global([data-theme="light"]) .step4__sms {
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(27, 42, 74, 0.08);
        }

        .step4__sms-header {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
          color: var(--text-secondary);
          font-size: 14px;
          margin-bottom: 16px;
        }

        .step4__sms-row {
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: center;
        }

        .step4__sms-phone {
          padding: 10px 16px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--glass-border);
          font-size: 14px;
          color: var(--text-primary);
          display: flex;
          gap: 6px;
        }

        :global(.light) .step4__sms-phone,
        :global([data-theme="light"]) .step4__sms-phone {
          background: rgba(0,0,0,0.03);
        }

        .step4__sms-prefix {
          color: var(--text-muted);
          font-weight: 600;
        }

        .step4__sms-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          border-radius: 10px;
          background: linear-gradient(135deg, #FF6B2C, #FF8F5E);
          color: white;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          font-family: var(--font-body);
          transition: all 0.2s;
        }

        .step4__sms-btn:hover:not(:disabled) {
          box-shadow: 0 4px 16px rgba(255, 107, 44, 0.3);
        }

        .step4__sms-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .step4__sms-btn--sent {
          background: #2D6A4F !important;
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

        .step4__skip {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 13px;
          cursor: pointer;
          font-family: var(--font-body);
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .step4__skip:hover {
          background: var(--glass-bg);
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
