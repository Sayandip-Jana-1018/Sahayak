'use client';

import { SignUp } from '@clerk/nextjs';
import { Suspense } from 'react';

const clerkAppearance = {
  variables: {
    colorPrimary: '#FF6B2C',
    colorBackground: 'rgba(10,10,20,0.95)',
    colorText: '#F8F6FF',
    colorInputBackground: 'rgba(255,255,255,0.06)',
    colorInputText: '#F8F6FF',
    colorTextSecondary: 'rgba(248,246,255,0.65)',
    borderRadius: '14px',
    fontFamily: '"DM Sans", sans-serif',
  },
  elements: {
    card: {
      background: 'rgba(15, 15, 30, 0.45)',
      backdropFilter: 'blur(32px) saturate(160%)',
      border: '1px solid rgba(255, 255, 255, 0.09)',
      borderTop: '1px solid rgba(255, 255, 255, 0.18)',
      borderRadius: '20px',
      boxShadow: '0 8px 40px rgba(0, 0, 0, 0.4)',
      padding: '32px',
    },
    headerTitle: {
      display: 'none',
    },
    headerSubtitle: {
      display: 'none',
    },
    socialButtonsBlockButton: {
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#F8F6FF',
      borderRadius: '12px',
      transition: 'all 0.2s ease',
      ':hover': {
        background: 'rgba(255,255,255,0.1)',
        borderColor: 'rgba(255,255,255,0.2)',
      },
    },
    formFieldInput: {
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#F8F6FF',
      borderRadius: '12px',
      fontSize: '15px',
      transition: 'border-color 0.2s ease',
      ':focus': {
        borderColor: '#FF6B2C',
        boxShadow: '0 0 0 2px rgba(255,107,44,0.15)',
      },
    },
    formFieldLabel: {
      color: 'rgba(248,246,255,0.7)',
      fontSize: '13px',
      fontWeight: '500',
    },
    formButtonPrimary: {
      background: 'linear-gradient(135deg, #FF6B2C 0%, #FF8F5E 100%)',
      borderRadius: '12px',
      fontWeight: '600',
      fontSize: '15px',
      boxShadow: '0 4px 20px rgba(255,107,44,0.3)',
      transition: 'all 0.2s ease',
      ':hover': {
        boxShadow: '0 6px 30px rgba(255,107,44,0.5)',
        transform: 'translateY(-1px)',
      },
    },
    footer: {
      background: 'transparent',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      paddingBottom: '16px',
    },
    footerActionLink: {
      color: '#FF6B2C',
      fontWeight: '500',
      ':hover': { color: '#FF8F5E' },
    },
    footerActionText: {
      color: 'rgba(248,246,255,0.5)',
    },
    dividerLine: {
      background: 'rgba(255,255,255,0.08)',
    },
    dividerText: {
      color: 'rgba(248,246,255,0.4)',
      fontSize: '12px',
    },
    identityPreviewEditButton: {
      color: '#FF6B2C',
    },
    formFieldInputShowPasswordButton: {
      color: 'rgba(248,246,255,0.5)',
      ':hover': { color: '#FF6B2C' },
    },
    otpCodeFieldInput: {
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#F8F6FF',
      borderRadius: '10px',
    },
    alert: {
      background: 'rgba(230,57,70,0.1)',
      border: '1px solid rgba(230,57,70,0.2)',
      borderRadius: '12px',
      color: '#F8F6FF',
    },
  },
};

const clerkAppearanceLight = {
  variables: {
    colorPrimary: '#FF6B2C',
    colorBackground: '#FFFBF0',
    colorText: '#1B2A4A',
    colorInputBackground: 'rgba(0,0,0,0.03)',
    colorInputText: '#1B2A4A',
    colorTextSecondary: 'rgba(27,42,74,0.65)',
    borderRadius: '14px',
    fontFamily: '"DM Sans", sans-serif',
  },
  elements: {
    card: {
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(32px) saturate(160%)',
      border: '1px solid rgba(27, 42, 74, 0.08)',
      borderRadius: '20px',
      boxShadow: '0 8px 40px rgba(27, 42, 74, 0.08)',
      padding: '32px',
    },
    headerTitle: {
      display: 'none',
    },
    headerSubtitle: {
      display: 'none',
    },
    socialButtonsBlockButton: {
      background: 'rgba(0,0,0,0.03)',
      border: '1px solid rgba(27,42,74,0.1)',
      color: '#1B2A4A',
      borderRadius: '12px',
    },
    formFieldInput: {
      background: 'rgba(0,0,0,0.03)',
      border: '1px solid rgba(27,42,74,0.12)',
      color: '#1B2A4A',
      borderRadius: '12px',
      ':focus': {
        borderColor: '#FF6B2C',
        boxShadow: '0 0 0 2px rgba(255,107,44,0.1)',
      },
    },
    formFieldLabel: { color: 'rgba(27,42,74,0.7)' },
    formButtonPrimary: {
      background: 'linear-gradient(135deg, #FF6B2C 0%, #FF8F5E 100%)',
      borderRadius: '12px',
      fontWeight: '600',
      boxShadow: '0 4px 20px rgba(255,107,44,0.2)',
    },
    footer: {
      background: 'transparent',
      borderTop: '1px solid rgba(27, 42, 74, 0.08)',
      paddingBottom: '16px',
    },
    footerActionLink: { color: '#FF6B2C' },
    footerActionText: { color: 'rgba(27,42,74,0.5)' },
    dividerLine: { background: 'rgba(27,42,74,0.08)' },
    dividerText: { color: 'rgba(27,42,74,0.4)' },
  },
};

function RegisterContent() {
  return (
    <div className="register-page">
      {/* Sahayak branding */}
      <div className="register-page__brand">
        <h1 className="register-page__title">Join Sahayak</h1>
        <p className="register-page__tagline">
          Apna Fon, Apni Bhasha, Apni Azaadi
        </p>
      </div>

      {/* Dark mode Clerk */}
      <div className="register-page__clerk register-page__clerk--dark">
        <SignUp
          appearance={clerkAppearance}
          forceRedirectUrl="/onboarding"
          signInUrl="/login"
          routing="hash"
        />
      </div>

      {/* Light mode Clerk */}
      <div className="register-page__clerk register-page__clerk--light">
        <SignUp
          appearance={clerkAppearanceLight}
          forceRedirectUrl="/onboarding"
          signInUrl="/login"
          routing="hash"
        />
      </div>

      <style jsx>{`
        .register-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }

        .register-page__brand {
          text-align: center;
          margin-bottom: 24px;
          margin-top: 60px;
        }

        .register-page__title {
          font-family: var(--font-display) !important;
          font-size: 28px !important;
          font-weight: 800 !important;
          color: var(--text-primary);
          margin: 0;
          letter-spacing: -0.02em;
        }

        .register-page__tagline {
          font-family: var(--font-caveat), 'Caveat', cursive;
          font-size: 20px;
          color: rgba(248, 246, 255, 0.6);
          margin-top: 4px;
          font-style: italic;
          transition: color 0.3s ease;
        }

        :global(.light) .register-page__tagline,
        :global([data-theme="light"]) .register-page__tagline {
          color: rgba(27, 42, 74, 0.6);
        }

        /* Force transparent backgrounds on all internal clerk layout elements */
        :global(.clerk-footer),
        :global(.clerk-footerAction),
        :global([class*="-footer"]),
        :global([class*="clerk-"]) {
          background-color: transparent !important;
        }

        .register-page__clerk--light {
          display: none;
        }

        :global(.light) .register-page__clerk--dark,
        :global([data-theme="light"]) .register-page__clerk--dark {
          display: none;
        }

        :global(.light) .register-page__clerk--light,
        :global([data-theme="light"]) .register-page__clerk--light {
          display: block;
        }
      `}</style>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        color: 'var(--text-muted)',
      }}>
        Loading...
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
