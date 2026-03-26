/**
 * PostHog Analytics Provider
 *
 * Wraps the app with PostHog for event tracking and feature flags.
 * Only initializes in production with a valid API key.
 *
 * NOTE: Install posthog-js before using:
 *   pnpm add posthog-js --filter=web
 */

// @ts-nocheck — PostHog SDK not yet installed, will be added before deployment
'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

    if (!key || process.env.NODE_ENV !== 'production') return;

    posthog.init(key, {
      api_host: host,
      capture_pageview: true,
      capture_pageleave: true,
      persistence: 'localStorage+cookie',
      loaded: (ph: any) => {
        if (process.env.NODE_ENV === 'development') ph.opt_out_capturing();
      },
    });
  }, []);

  useEffect(() => {
    if (isSignedIn && user) {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
      });
    }
  }, [isSignedIn, user]);

  return (
    <PHProvider client={posthog}>
      {children}
    </PHProvider>
  );
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    posthog.capture(event, properties);
  }
}
