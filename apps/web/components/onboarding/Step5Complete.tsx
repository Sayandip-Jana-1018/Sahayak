'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ArrowRight, Shield, Phone, Mic, Smartphone } from 'lucide-react';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useUser } from '@clerk/nextjs';

const LANG_NAMES: Record<string, string> = {
  hi: 'Hindi', ta: 'Tamil', bn: 'Bengali', mr: 'Marathi', te: 'Telugu',
  kn: 'Kannada', gu: 'Gujarati', pa: 'Punjabi', ml: 'Malayalam', ur: 'Urdu', en: 'English',
};

export function Step5Complete() {
  const router = useRouter();
  const { user } = useUser();
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/onboarding/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to complete onboarding');
      }

      // Update Clerk metadata
      if (user) {
        try {
          await user.update({
            unsafeMetadata: {
              onboarding_complete: true,
              role: formData.userType === 'organization' ? 'ngo_admin' : 'family',
            },
          });
        } catch {
          // Non-critical — metadata can be updated later
        }
      }

      router.push('/dashboard');
    } catch (err) {
      setSubmitError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  const maskedPhone = formData.emergencyContactPhone
    ? '•••••' + formData.emergencyContactPhone.slice(-4)
    : '—';

  return (
    <div className="step5">
      {/* Animated checkmark */}
      <div className="step5__checkmark">
        <svg viewBox="0 0 52 52" className="step5__check-svg">
          <circle cx="26" cy="26" r="24" fill="none" stroke="#FF6B2C" strokeWidth="2.5" className="step5__circle" />
          <path d="M14,27 L22,35 L38,17" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="step5__check-path" />
        </svg>
      </div>

      <h2 className="step5__title">Sahayak is ready.</h2>
      <p className="step5__subtitle">
        {formData.elderlyName} can now speak in {LANG_NAMES[formData.primaryLanguage] || formData.primaryLanguage} to
        manage medicines, payments, and emergencies — all by voice.
      </p>

      {/* Summary card */}
      <div className="step5__summary">
        <div className="step5__summary-row">
          <Shield size={16} className="step5__summary-icon" />
          <span className="step5__summary-label">Profile</span>
          <span className="step5__summary-value">{formData.elderlyName}, {formData.ageYears} yrs — {formData.state}</span>
        </div>
        <div className="step5__summary-divider" />
        <div className="step5__summary-row">
          <span className="step5__summary-icon" style={{ fontSize: '16px' }}>🗣️</span>
          <span className="step5__summary-label">Language</span>
          <span className="step5__summary-value">{LANG_NAMES[formData.primaryLanguage]}</span>
        </div>
        <div className="step5__summary-divider" />
        <div className="step5__summary-row">
          <Phone size={16} className="step5__summary-icon" />
          <span className="step5__summary-label">Emergency</span>
          <span className="step5__summary-value">{formData.emergencyContactName} — {maskedPhone}</span>
        </div>
        <div className="step5__summary-divider" />
        <div className="step5__summary-row">
          <Mic size={16} className="step5__summary-icon" />
          <span className="step5__summary-label">Voice</span>
          <span className={`step5__summary-value ${formData.voiceProfileComplete ? 'step5__summary-value--jade' : 'step5__summary-value--amber'}`}>
            {formData.voiceProfileComplete ? 'Recorded ✓' : 'Skipped (set up later)'}
          </span>
        </div>
        <div className="step5__summary-divider" />
        <div className="step5__summary-row">
          <Smartphone size={16} className="step5__summary-icon" />
          <span className="step5__summary-label">App</span>
          <span className={`step5__summary-value ${formData.appInstalled ? 'step5__summary-value--jade' : 'step5__summary-value--amber'}`}>
            {formData.appInstalled ? 'Installed ✓' : 'Pending'}
          </span>
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

      <style jsx>{`
        .step5 {
          text-align: center;
          padding-top: 16px;
        }

        .step5__checkmark {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
        }

        .step5__check-svg {
          width: 100%;
          height: 100%;
        }

        .step5__circle {
          stroke-dasharray: 150;
          stroke-dashoffset: 150;
          animation: draw-circle 0.6s ease-out forwards;
        }

        .step5__check-path {
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
          animation: draw-check 0.4s ease-out 0.5s forwards;
        }

        @keyframes draw-circle {
          to { stroke-dashoffset: 0; }
        }

        @keyframes draw-check {
          to { stroke-dashoffset: 0; }
        }

        .step5__title {
          font-family: var(--font-display) !important;
          font-size: 40px !important;
          font-weight: 800 !important;
          letter-spacing: -0.02em;
          color: var(--text-primary);
          margin-bottom: 12px;
        }

        .step5__subtitle {
          font-size: 16px;
          color: var(--text-secondary);
          max-width: 500px;
          margin: 0 auto 32px;
          line-height: 1.6;
        }

        .step5__summary {
          padding: 24px 32px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 40px;
          text-align: left;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }

        :global(.light) .step5__summary,
        :global([data-theme="light"]) .step5__summary {
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(27, 42, 74, 0.08);
          box-shadow: 0 12px 40px rgba(27, 42, 74, 0.05);
        }

        .step5__summary-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
        }

        .step5__summary-icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .step5__summary-label {
          font-size: 13px;
          color: var(--text-muted);
          min-width: 80px;
          font-weight: 500;
        }

        .step5__summary-value {
          font-size: 14px;
          color: var(--text-primary);
          font-weight: 500;
        }

        .step5__summary-value--jade {
          color: #2D6A4F;
        }

        .step5__summary-value--amber {
          color: #FFB703;
        }

        .step5__summary-divider {
          height: 1px;
          background: var(--glass-border);
        }

        .step5__error {
          color: #E63946;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .step5__cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 40px;
          border-radius: 14px;
          background: linear-gradient(135deg, #FF6B2C, #FF8F5E);
          color: white;
          border: none;
          cursor: pointer;
          font-size: 16px;
          font-weight: 700;
          font-family: var(--font-body);
          box-shadow: 0 4px 24px rgba(255, 107, 44, 0.35);
          transition: all 0.2s ease;
          width: 100%;
          max-width: 360px;
          justify-content: center;
        }

        .step5__cta:hover:not(:disabled) {
          box-shadow: 0 8px 36px rgba(255, 107, 44, 0.5);
          transform: translateY(-2px);
        }

        .step5__cta:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .step5__spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 600px) {
          .step5__title {
            font-size: 28px !important;
          }

          .step5__cta {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
