'use client';

import { Users, User, Building2, Check } from 'lucide-react';
import { useOnboardingStore, UserType } from '@/store/onboardingStore';

const cards: { type: UserType; icon: typeof Users; color: string; title: string; subtitle: string }[] = [
  {
    type: 'family',
    icon: Users,
    color: '#3B28CC',
    title: 'For a family member',
    subtitle: 'I want to monitor and support an elderly parent or relative',
  },
  {
    type: 'self',
    icon: User,
    color: '#2D6A4F',
    title: 'For myself',
    subtitle: 'I am elderly and want to use Sahayak on my own phone',
  },
  {
    type: 'organization',
    icon: Building2,
    color: '#FF6B2C',
    title: 'For my organization',
    subtitle: 'NGO, hospital, old age home, or CSC',
  },
];

export function Step1UserType() {
  const { formData, updateFormData } = useOnboardingStore();

  return (
    <div className="step1">
      <h2 className="step1__title">Who is Sahayak for?</h2>
      <p className="step1__subtitle">Help us personalize your experience</p>

      <div className="step1__cards">
        {cards.map(({ type, icon: Icon, color, title, subtitle }) => {
          const isSelected = formData.userType === type;
          return (
            <button
              key={type}
              className={`step1__card ${isSelected ? 'step1__card--selected' : ''}`}
              onClick={() => updateFormData({ userType: type })}
              aria-pressed={isSelected}
            >
              {isSelected && (
                <div className="step1__card-check">
                  <Check size={14} strokeWidth={3} />
                </div>
              )}
              <div className="step1__card-icon" style={{ background: `${color}15`, color }}>
                <Icon size={28} />
              </div>
              <h3 className="step1__card-title">{title}</h3>
              <p className="step1__card-subtitle">{subtitle}</p>
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .step1 {
          text-align: center;
        }

        .step1__title {
          font-size: 32px !important;
          font-weight: 800 !important;
          letter-spacing: -0.02em;
          margin-bottom: 12px;
          color: var(--text-primary);
          font-family: var(--font-display);
        }

        .step1__subtitle {
          color: var(--text-secondary);
          font-size: 16px;
          margin-bottom: 40px;
        }

        .step1__cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .step1__card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 32px 24px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: center;
          font-family: var(--font-body);
        }

        :global(.light) .step1__card,
        :global([data-theme="light"]) .step1__card {
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(27, 42, 74, 0.08);
        }

        .step1__card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
        }

        :global(.light) .step1__card:hover,
        :global([data-theme="light"]) .step1__card:hover {
          background: rgba(255, 255, 255, 0.8);
          border-color: rgba(27, 42, 74, 0.15);
          box-shadow: 0 12px 30px rgba(27, 42, 74, 0.08);
        }

        .step1__card--selected {
          border-color: #FF6B2C !important;
          background: linear-gradient(145deg, rgba(255, 107, 44, 0.1), rgba(255, 143, 94, 0.05)) !important;
          box-shadow: 0 0 30px rgba(255, 107, 44, 0.15) !important;
        }

        .step1__card-check {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #FF6B2C;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(255, 107, 44, 0.4);
          animation: scale-up 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes scale-up {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .step1__card-icon {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
          transition: transform 0.3s ease;
        }

        .step1__card:hover .step1__card-icon {
          transform: scale(1.05);
        }

        .step1__card-title {
          font-size: 18px !important;
          font-weight: 600 !important;
          color: var(--text-primary);
          margin: 0;
        }

        .step1__card-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
        }

        @media (max-width: 700px) {
          .step1__cards {
            grid-template-columns: 1fr;
          }

          .step1__card {
            flex-direction: row;
            text-align: left;
            gap: 16px;
            padding: 20px;
          }

          .step1__card-icon {
            flex-shrink: 0;
          }
        }
      `}</style>
    </div>
  );
}
