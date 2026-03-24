'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useUser } from '@clerk/nextjs';
import { Step1UserType } from '@/components/onboarding/Step1UserType';
import { Step2ElderlyDetails } from '@/components/onboarding/Step2ElderlyDetails';
import { Step3VoiceProfile } from '@/components/onboarding/Step3VoiceProfile';
import { Step4InstallApp } from '@/components/onboarding/Step4InstallApp';
import { Step5Complete } from '@/components/onboarding/Step5Complete';

const STEP_LABELS = ['Who?', 'Details', 'Voice', 'Install', 'Done'];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const { currentStep, setStep, nextStep, prevStep, formData } = useOnboardingStore();

  const isStepValid = useCallback((): boolean => {
    switch (currentStep) {
      case 1: return !!formData.userType;
      case 2:
        return (
          formData.elderlyName.length >= 2 &&
          formData.state.length > 0 &&
          !!formData.primaryLanguage &&
          formData.emergencyContactName.length >= 2 &&
          /^[6-9]\d{9}$/.test(formData.emergencyContactPhone)
        );
      case 3: return true; // Voice can be skipped
      case 4: return true; // Install can be skipped
      case 5: return true;
      default: return false;
    }
  }, [currentStep, formData]);

  const handleNext = () => {
    if (isStepValid()) {
      nextStep();
    }
  };

  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -60 : 60,
      opacity: 0,
    }),
  };

  return (
    <div className="onboarding">
      {/* Progress bar */}
      <div className="onboarding__progress">
        <div
          className="onboarding__progress-fill"
          style={{ width: `${(currentStep / 5) * 100}%` }}
        />
      </div>

      {/* Step indicators with connecting progress bar */}
      <div className="onboarding__steps">
        {/* Background track line */}
        <div className="onboarding__steps-track" />
        {/* Filled progress line */}
        <div
          className="onboarding__steps-fill"
          style={{ width: `${((currentStep - 1) / (STEP_LABELS.length - 1)) * 100}%` }}
        />
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          return (
            <div key={label} className="onboarding__step-indicator">
              <div
                className={`onboarding__step-dot ${
                  isCompleted ? 'onboarding__step-dot--completed' :
                  isActive ? 'onboarding__step-dot--active' :
                  'onboarding__step-dot--upcoming'
                }`}
              >
                {isCompleted ? <Check size={10} strokeWidth={3} /> : stepNum}
              </div>
              <span className={`onboarding__step-label ${isActive ? 'onboarding__step-label--active' : ''}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step content wrapped in a premium glass panel */}
      <div className="onboarding__glass-panel">
        <div className="onboarding__content">
          <AnimatePresence mode="wait" custom={1}>
            <motion.div
              key={currentStep}
              custom={1}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {currentStep === 1 && <Step1UserType />}
              {currentStep === 2 && <Step2ElderlyDetails />}
              {currentStep === 3 && <Step3VoiceProfile />}
              {currentStep === 4 && <Step4InstallApp />}
              {currentStep === 5 && <Step5Complete />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {currentStep < 5 && (
          <div className="onboarding__nav">
            {currentStep > 1 && (
              <button className="onboarding__nav-back" onClick={prevStep} aria-label="Go back">
                <ArrowLeft size={18} />
                Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            <button
              className={`onboarding__nav-next ${!isStepValid() ? 'onboarding__nav-next--disabled' : ''}`}
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              {currentStep === 4 ? 'Continue' : 'Next'}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .onboarding {
          min-height: 100vh;
          padding-top: calc(var(--navbar-height) + 40px);
          padding-bottom: 60px;
          max-width: 1100px;
          margin: 0 auto;
          padding-left: 20px;
          padding-right: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .onboarding__glass-panel {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(40px) saturate(200%);
          -webkit-backdrop-filter: blur(40px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 32px;
          padding: 48px;
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.3);
          position: relative;
          overflow: hidden;
        }

        :global(.light) .onboarding__glass-panel,
        :global([data-theme="light"]) .onboarding__glass-panel {
          background: rgba(255, 255, 255, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 20px 60px rgba(27, 42, 74, 0.06);
        }

        .onboarding__progress {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(255, 255, 255, 0.06);
          z-index: 100;
        }

        :global(.light) .onboarding__progress,
        :global([data-theme="light"]) .onboarding__progress {
          background: rgba(27, 42, 74, 0.06);
        }

        .onboarding__progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #FF6B2C, #FF8F5E);
          transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          border-radius: 0 2px 2px 0;
        }

        .onboarding__steps {
          display: flex;
          justify-content: space-between;
          margin-bottom: 44px;
          margin-top: 16px;
          position: relative;
          max-width: 480px;
          width: 100%;
        }

        .onboarding__steps-track {
          position: absolute;
          top: 16px;
          left: 16px;
          right: 16px;
          height: 2px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.06);
          z-index: 0;
        }

        :global(.light) .onboarding__steps-track,
        :global([data-theme="light"]) .onboarding__steps-track {
          background: rgba(27, 42, 74, 0.08);
        }

        .onboarding__steps-fill {
          position: absolute;
          top: 16px;
          left: 16px;
          height: 2px;
          border-radius: 2px;
          background: linear-gradient(90deg, #FF6B2C, #FF8F5E);
          box-shadow: 0 0 8px rgba(255, 107, 44, 0.4);
          z-index: 1;
          transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .onboarding__step-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          position: relative;
          z-index: 2;
        }

        .onboarding__step-dot {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          font-family: var(--font-accent);
        }

        .onboarding__step-dot--active {
          background: linear-gradient(135deg, #FF6B2C, #FF8F5E);
          color: white;
          box-shadow: 0 0 0 4px rgba(255, 107, 44, 0.15), 0 4px 16px rgba(255, 107, 44, 0.35);
          animation: stepPulse 2s ease-in-out infinite;
        }

        @keyframes stepPulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(255, 107, 44, 0.15), 0 4px 16px rgba(255, 107, 44, 0.35); }
          50% { box-shadow: 0 0 0 8px rgba(255, 107, 44, 0.08), 0 4px 20px rgba(255, 107, 44, 0.5); }
        }

        .onboarding__step-dot--completed {
          background: linear-gradient(135deg, #FF6B2C, #FF8F5E);
          color: white;
          box-shadow: 0 2px 8px rgba(255, 107, 44, 0.25);
        }

        .onboarding__step-dot--upcoming {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-muted);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        :global(.light) .onboarding__step-dot--upcoming,
        :global([data-theme="light"]) .onboarding__step-dot--upcoming {
          background: rgba(27, 42, 74, 0.06);
          color: rgba(27, 42, 74, 0.4);
          border-color: rgba(27, 42, 74, 0.1);
        }

        .onboarding__step-label {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .onboarding__step-label--active {
          color: #FF6B2C;
        }

        .onboarding__content {
          min-height: 400px;
        }

        .onboarding__nav {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 48px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        :global(.light) .onboarding__nav,
        :global([data-theme="light"]) .onboarding__nav {
          border-top-color: rgba(27, 42, 74, 0.06);
        }

        .onboarding__nav-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          border-radius: 12px;
          background: transparent;
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          font-family: var(--font-body);
        }

        .onboarding__nav-back:hover {
          background: var(--glass-bg-hover);
          color: var(--text-primary);
        }

        .onboarding__nav-next {
          padding: 12px 32px;
          border-radius: 12px;
          background: linear-gradient(135deg, #FF6B2C, #FF8F5E);
          color: white;
          border: none;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          font-family: var(--font-body);
          box-shadow: 0 4px 20px rgba(255, 107, 44, 0.3);
          transition: all 0.2s ease;
        }

        .onboarding__nav-next:hover:not(:disabled) {
          box-shadow: 0 6px 30px rgba(255, 107, 44, 0.5);
          transform: translateY(-1px);
        }

        .onboarding__nav-next--disabled {
          opacity: 0.4;
          cursor: not-allowed;
          box-shadow: none;
        }

        @media (max-width: 600px) {
          .onboarding {
            padding-top: calc(var(--navbar-height) + 24px);
          }
          .onboarding__glass-panel {
            padding: 32px 20px;
            border-radius: 24px;
          }
          .onboarding__steps {
            gap: 16px;
          }

          .onboarding__step-label {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
