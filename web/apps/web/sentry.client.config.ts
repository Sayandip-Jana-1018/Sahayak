/**
 * Sentry Configuration — Web (Next.js)
 *
 * Captures frontend errors, performance traces, and replay sessions.
 * Uses environment-based DSN so Sentry is disabled in development.
 *
 * NOTE: Install @sentry/nextjs before using:
 *   pnpm add @sentry/nextjs --filter=web
 */

// @ts-nocheck — Sentry SDK not yet installed, will be added before deployment
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',

  enabled: process.env.NODE_ENV === 'production',

  tracesSampleRate: 0.2,

  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    /^NetworkError/,
    /^Loading chunk/,
  ],

  beforeSend(event: any) {
    return event;
  },
});
