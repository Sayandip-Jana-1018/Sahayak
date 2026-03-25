'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ArrowRight, Shield, Phone, Mic, Smartphone } from 'lucide-react';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useUser, useAuth } from '@clerk/nextjs';
import { apiRequest } from '@/lib/api';

const LANG_NAMES: Record<string, string> = {
  hi: 'Hindi', ta: 'Tamil', bn: 'Bengali', mr: 'Marathi', te: 'Telugu',
  kn: 'Kannada', gu: 'Gujarati', pa: 'Punjabi', ml: 'Malayalam', ur: 'Urdu', en: 'English',
};

export function Step5Complete() {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const { formData, isSubmitting, setSubmitting } = useOnboardingStore();
  const [confettiFired, setConfettiFired] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Confetti on mount
  useEffect(() => {
    if (confettiFired) return;
    setConfettiFired(true);
    import('canvas-confetti').then((mod) => {
      const fire = mod.default;
      fire({
        particleCount: 120,
        spread: 90,
        colors: ['#FF6B2C', '#3B28CC', '#F5C842', '#00B67A'],
        origin: { y: 0.6 },
      });
    });
  }, [confettiFired]);

  const handleComplete = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      console.log('[Onboarding] Sending complete request...');
      const result = await apiRequest('/api/onboarding/complete', getToken, {
        method: 'POST',
        body: {
          userType: formData.userType,
          elderlyName: formData.elderlyName,
          ageYears: formData.ageYears,
          state: formData.state,
          district: formData.district,
          primaryLanguage: formData.primaryLanguage,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
          voiceProfileComplete: formData.voiceProfileComplete,
          voiceSampleIds: formData.voiceSampleIds,
          appInstalled: formData.appInstalled,
        },
      });
      console.log('[Onboarding] API success:', result);

      // Set a cookie that the middleware checks as a fallback.
      // Clerk's JWT refresh can take seconds — the cookie is instant.
      document.cookie = 'sahayak_onboarding_done=1; path=/; max-age=31536000; SameSite=Lax';
      console.log('[Onboarding] Cookie set, redirecting to dashboard...');
      
      setSubmitting(false);
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('[Onboarding] Error:', err);
      setSubmitError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  const maskedPhone = formData.emergencyContactPhone
    ? '•••••' + formData.emergencyContactPhone.slice(-4)
    : '—';

  return (
    <div className="step5">
      <div className="step5__content">
        
        {/* Connection Visualization */}
        <div className="step5__connection">
          <div className="step5__avatar-wrapper">
            {user?.imageUrl ? (
              <img src={user?.imageUrl} alt="Caregiver" className="step5__avatar" />
            ) : (
              <div className="step5__avatar step5__avatar--fallback">
                <Shield size={24} />
              </div>
            )}
            <div className="step5__avatar-label">You</div>
          </div>

          <div className="step5__link-line">
            <div className="step5__link-dot" />
            <div className="step5__link-dot" />
            <div className="step5__link-dot" />
            <div className="step5__link-center">
              <Check size={16} strokeWidth={3} />
            </div>
            <div className="step5__link-dot" />
            <div className="step5__link-dot" />
            <div className="step5__link-dot" />
          </div>

          <div className="step5__avatar-wrapper">
            <div className="step5__avatar step5__avatar--elderly">
              {formData.elderlyName ? formData.elderlyName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="step5__avatar-label">{formData.elderlyName?.split(' ')[0] || 'User'}</div>
          </div>
        </div>

        <h2 className="step5__title">Sahayak is ready.</h2>
        <p className="step5__subtitle">
          {formData.elderlyName} can now speak in <strong>{LANG_NAMES[formData.primaryLanguage] || formData.primaryLanguage}</strong> to
          manage medicines, payments, and emergencies — all by voice.
        </p>

        {/* Premium Summary Card */}
        <div className="step5__summary-wrapper">
          <div className="step5__summary-glow" />
          <div className="step5__summary">
            
            <div className="step5__summary-row">
              <div className="step5__summary-col-left">
                <Shield size={16} className="step5__summary-icon" />
                <span className="step5__summary-label">Profile</span>
              </div>
              <div className="step5__summary-col-right">
                <span className="step5__summary-value">{formData.elderlyName}, {formData.ageYears} yrs<br />{formData.state}</span>
              </div>
            </div>
            
            <div className="step5__summary-divider" />
            
            <div className="step5__summary-row">
              <div className="step5__summary-col-left">
                <span className="step5__summary-icon">🗣️</span>
                <span className="step5__summary-label">Language</span>
              </div>
              <div className="step5__summary-col-right">
                <span className="step5__summary-value">{LANG_NAMES[formData.primaryLanguage]}</span>
              </div>
            </div>
            
            <div className="step5__summary-divider" />
            
            <div className="step5__summary-row">
              <div className="step5__summary-col-left">
                <Phone size={16} className="step5__summary-icon" />
                <span className="step5__summary-label">Emergency Contact</span>
              </div>
              <div className="step5__summary-col-right">
                <span className="step5__summary-value">{formData.emergencyContactName}<br />{maskedPhone}</span>
              </div>
            </div>
            
            <div className="step5__summary-divider" />
            
            <div className="step5__summary-row">
              <div className="step5__summary-col-left">
                <Mic size={16} className="step5__summary-icon" />
                <span className="step5__summary-label">Voice Recognition</span>
              </div>
              <div className="step5__summary-col-right">
                <span className={`step5__status-badge ${formData.voiceProfileComplete ? 'step5__status-badge--success' : 'step5__status-badge--warning'}`}>
                  {formData.voiceProfileComplete ? 'Trained ✓' : 'Setup Later'}
                </span>
              </div>
            </div>
            
            <div className="step5__summary-divider" />
            
            <div className="step5__summary-row">
              <div className="step5__summary-col-left">
                <Smartphone size={16} className="step5__summary-icon" />
                <span className="step5__summary-label">App Installation</span>
              </div>
              <div className="step5__summary-col-right">
                <span className={`step5__status-badge ${formData.appInstalled ? 'step5__status-badge--success' : 'step5__status-badge--warning'}`}>
                  {formData.appInstalled ? 'Installed ✓' : 'Pending'}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Error */}
        {submitError && (
          <p className="step5__error">{submitError}</p>
        )}

        {/* CTA */}
        <button
          className="step5__cta"
          onClick={handleComplete}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="step5__spinner" />
          ) : (
            <>
              Open Dashboard
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        .step5 {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          min-height: 60vh;
        }

        .step5__content {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 600px;
          animation: fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Connection Section */
        .step5__connection {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 32px;
          margin-top: 20px;
        }

        .step5__avatar-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .step5__avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 4px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
          object-fit: cover;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 32px;
          font-weight: 700;
          color: white;
          position: relative;
        }

        :global(.light) .step5__avatar,
        :global([data-theme="light"]) .step5__avatar {
          border-color: rgba(255,255,255,1);
          box-shadow: 0 12px 32px rgba(27, 42, 74, 0.1);
          color: var(--text-primary);
        }

        .step5__avatar--elderly {
          background: linear-gradient(135deg, #FF6B2C, #FFD166);
          color: white !important;
          border-color: rgba(255, 107, 44, 0.3);
        }

        :global(.light) .step5__avatar--elderly,
        :global([data-theme="light"]) .step5__avatar--elderly {
          border-color: #FFFFFF;
        }

        .step5__avatar-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          background: rgba(255,255,255,0.05);
          padding: 4px 12px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        :global(.light) .step5__avatar-label,
        :global([data-theme="light"]) .step5__avatar-label {
          background: rgba(27,42,74,0.05);
          border-color: rgba(27,42,74,0.05);
        }

        .step5__link-line {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 16px;
        }

        .step5__link-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #FF6B2C;
          opacity: 0.5;
        }

        .step5__link-center {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #2D6A4F;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 0 4px rgba(45, 106, 79, 0.2);
          animation: pulse-check 2s infinite;
        }

        @keyframes pulse-check {
          0% { box-shadow: 0 0 0 0 rgba(45, 106, 79, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(45, 106, 79, 0); }
          100% { box-shadow: 0 0 0 0 rgba(45, 106, 79, 0); }
        }

        /* Headers */
        .step5__title {
          font-family: var(--font-display) !important;
          font-size: 42px !important;
          font-weight: 800 !important;
          letter-spacing: -0.02em;
          color: var(--text-primary);
          margin-bottom: 12px;
          text-align: center;
        }

        .step5__subtitle {
          font-size: 16px;
          color: var(--text-secondary);
          max-width: 500px;
          margin: 0 auto 40px;
          line-height: 1.6;
          text-align: center;
        }

        .step5__subtitle strong {
          color: var(--text-primary);
        }

        /* Summary Card */
        .step5__summary-wrapper {
          position: relative;
          width: 100%;
          max-width: 540px;
          margin: 0 auto 48px;
        }

        .step5__summary-glow {
          position: absolute;
          inset: -2px;
          background: linear-gradient(135deg, rgba(255, 107, 44, 0.4), rgba(45, 106, 79, 0.4));
          filter: blur(24px);
          border-radius: 28px;
          z-index: -1;
          opacity: 0.5;
        }

        :global(.light) .step5__summary-glow,
        :global([data-theme="light"]) .step5__summary-glow {
          background: linear-gradient(135deg, rgba(255, 107, 44, 0.15), rgba(45, 106, 79, 0.15));
          opacity: 0.8;
          filter: blur(20px);
        }

        .step5__summary {
          padding: 32px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(32px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3), inset 0 0 32px rgba(255, 255, 255, 0.02);
          width: 100%;
        }

        :global(.light) .step5__summary,
        :global([data-theme="light"]) .step5__summary {
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 24px 60px rgba(27, 42, 74, 0.08), inset 0 0 32px rgba(255, 255, 255, 0.5);
        }

        .step5__summary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
          gap: 20px;
        }

        .step5__summary-col-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
          width: 45%;
        }

        .step5__summary-col-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex: 1;
          text-align: right;
        }

        .step5__summary-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }

        :global(.light) .step5__summary-icon,
        :global([data-theme="light"]) .step5__summary-icon {
          background: rgba(27, 42, 74, 0.06);
          color: var(--text-primary);
        }

        .step5__summary-label {
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .step5__summary-value {
          font-size: 15px;
          color: var(--text-primary);
          font-weight: 500;
          line-height: 1.4;
        }

        .step5__summary-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
          margin: 16px 0;
          border-radius: 1px;
        }

        :global(.light) .step5__summary-divider,
        :global([data-theme="light"]) .step5__summary-divider {
          background: rgba(27, 42, 74, 0.08);
        }

        .step5__status-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          width: max-content;
        }

        .step5__status-badge--success {
          background: rgba(45, 106, 79, 0.15);
          color: #2D6A4F;
          border: 1px solid rgba(45, 106, 79, 0.2);
        }

        .step5__status-badge--warning {
          background: rgba(255, 183, 3, 0.15);
          color: #E5A300;
          border: 1px solid rgba(255, 183, 3, 0.2);
        }

        :global(.light) .step5__status-badge--warning,
        :global([data-theme="light"]) .step5__status-badge--warning {
          color: #B38000;
        }

        /* Error & CTA */
        .step5__error {
          color: #E63946;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .step5__cta {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 18px 40px;
          border-radius: 16px;
          background: linear-gradient(135deg, #FF6B2C, #FF8F5E);
          color: white;
          font-size: 18px;
          font-weight: 700;
          font-family: var(--font-body);
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 12px 32px rgba(255, 107, 44, 0.3);
          margin-bottom: 40px;
        }

        .step5__cta:hover:not(:disabled) {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 20px 40px rgba(255, 107, 44, 0.4);
        }

        .step5__cta:disabled {
          opacity: 0.8;
          cursor: not-allowed;
          filter: grayscale(0.2);
        }

        .step5__spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
          .step5__cta {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
