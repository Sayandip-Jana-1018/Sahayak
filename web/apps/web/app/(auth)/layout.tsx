'use client';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout">
      {/* Tiranga top bar */}
      <div className="auth-layout__tiranga" />

      <div className="auth-layout__content">
        {children}
      </div>

      <style jsx>{`
        .auth-layout {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: transparent;
        }

        /* Removed CSS that hid the Navbar — navbar will now show */

        /* Tiranga top bar — always visible, subtle */
        .auth-layout__tiranga {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #FF9933 33%, #FFFFFF 33% 66%, #138808 66%);
          z-index: 9999;
          opacity: 0.8;
        }

        :global(.dark) .auth-layout__tiranga,
        :global([data-theme="dark"]) .auth-layout__tiranga {
          opacity: 0.5;
        }

        .auth-layout__content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 480px;
          padding: 40px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        @media (max-width: 600px) {
          .auth-layout__content {
            padding: 24px 16px;
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
