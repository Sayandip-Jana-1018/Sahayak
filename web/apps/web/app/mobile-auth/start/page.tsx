'use client';

import { useClerk } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';

function MobileAuthStartContent() {
  const searchParams = useSearchParams();
  const clerk = useClerk();
  const [error, setError] = useState<string | null>(null);

  const provider = searchParams.get('provider');
  const redirectUri = searchParams.get('redirect_uri') || 'sahayak://auth-callback';

  const strategy = useMemo(() => {
    switch (provider) {
      case 'google':
        return 'oauth_google';
      case 'github':
        return 'oauth_github';
      default:
        return null;
    }
  }, [provider]);

  useEffect(() => {
    if (!strategy) {
      setError('Unknown sign-in provider.');
      return;
    }
    const signIn = clerk.client?.signIn;
    if (!signIn) return;

    const callbackUrl = `/mobile-auth/callback?redirect_uri=${encodeURIComponent(redirectUri)}`;
    const completeUrl = `/mobile-auth/complete?redirect_uri=${encodeURIComponent(redirectUri)}`;

    signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: callbackUrl,
      redirectUrlComplete: completeUrl,
    }).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : 'Unable to start social sign-in.';
      setError(message);
    });
  }, [clerk, redirectUri, strategy]);

  return (
    <div style={styles.shell}>
      <div style={styles.card}>
        <div style={styles.dot} />
        <h1 style={styles.title}>Connecting to {provider ?? 'social'} sign-in</h1>
        <p style={styles.copy}>
          We&apos;re opening the secure Clerk flow now. Keep this window open for a moment.
        </p>
        {error ? <p style={styles.error}>{error}</p> : <div style={styles.spinner} />}
      </div>
    </div>
  );
}

export default function MobileAuthStartPage() {
  return (
    <Suspense fallback={null}>
      <MobileAuthStartContent />
    </Suspense>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    background:
      'radial-gradient(circle at top, rgba(124,77,255,0.18), transparent 28%), radial-gradient(circle at 25% 20%, rgba(255,153,51,0.22), transparent 24%), #0a0a14',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '28px',
    borderRadius: '28px',
    background: 'rgba(20,20,36,0.72)',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
    backdropFilter: 'blur(28px)',
    textAlign: 'center',
    color: '#f8f6ff',
  },
  dot: {
    width: '12px',
    height: '12px',
    margin: '0 auto 16px',
    borderRadius: '999px',
    background: '#ff9933',
    boxShadow: '0 0 18px rgba(255,153,51,0.8)',
  },
  title: {
    margin: '0 0 10px',
    fontSize: '28px',
    lineHeight: 1.1,
    fontWeight: 700,
  },
  copy: {
    margin: '0',
    color: 'rgba(248,246,255,0.7)',
    lineHeight: 1.6,
  },
  error: {
    marginTop: '18px',
    color: '#ff8f8f',
  },
  spinner: {
    width: '28px',
    height: '28px',
    margin: '22px auto 0',
    borderRadius: '999px',
    border: '3px solid rgba(255,255,255,0.14)',
    borderTopColor: '#ff9933',
    animation: 'spin 0.9s linear infinite',
  },
};
