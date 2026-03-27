'use client';

import { useAuth } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';

function MobileAuthCompleteContent() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const redirectUri = searchParams.get('redirect_uri') || 'sahayak://auth-callback';
  const apiBaseUrl = useMemo(() => {
    if (typeof window === 'undefined') return 'http://localhost:8080';
    return `${window.location.protocol}//${window.location.hostname}:8080`;
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setError('The social sign-in session was not completed.');
      return;
    }

    let cancelled = false;

    async function complete() {
      try {
        const clerkToken = await getToken();
        if (!clerkToken) {
          throw new Error('Missing Clerk session token.');
        }

        const response = await fetch(`${apiBaseUrl}/api/auth/social-exchange`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ clerkToken }),
        });

        if (!response.ok) {
          throw new Error('The backend could not complete the social exchange.');
        }

        const data = await response.json();
        const appToken = data?.token as string | undefined;
        if (!appToken) {
          throw new Error('The app session token was missing.');
        }

        if (cancelled) return;
        const separator = redirectUri.includes('?') ? '&' : '?';
        window.location.replace(
          `${redirectUri}${separator}token=${encodeURIComponent(appToken)}`,
        );
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Unable to complete social sign-in.';
        setError(message);
        const separator = redirectUri.includes('?') ? '&' : '?';
        window.location.replace(
          `${redirectUri}${separator}error=${encodeURIComponent(message)}`,
        );
      }
    }

    complete();
    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, getToken, isLoaded, isSignedIn, redirectUri]);

  return (
    <div style={styles.shell}>
      <div style={styles.card}>
        <div style={styles.dot} />
        <h1 style={styles.title}>Finishing your sign-in</h1>
        <p style={styles.copy}>
          We&apos;re carrying your secure session back into the app now.
        </p>
        {error ? <p style={styles.error}>{error}</p> : <div style={styles.spinner} />}
      </div>
    </div>
  );
}

export default function MobileAuthCompletePage() {
  return (
    <Suspense fallback={null}>
      <MobileAuthCompleteContent />
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
    background: '#7c4dff',
    boxShadow: '0 0 18px rgba(124,77,255,0.8)',
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
    borderTopColor: '#7c4dff',
  },
};
