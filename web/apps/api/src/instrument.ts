/**
 * Sentry Configuration — API (Fastify/Node)
 *
 * Captures backend errors and performance traces.
 * Import this at the very top of server.ts (before any other imports).
 *
 * NOTE: Install @sentry/node before using:
 *   pnpm add @sentry/node --filter=@sahayak/api
 */

// @ts-nocheck — Sentry SDK not yet installed, will be added before deployment
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN || '',

  enabled: process.env.NODE_ENV === 'production',

  tracesSampleRate: 0.3,

  integrations: [
    Sentry.httpIntegration(),
  ],

  beforeSend(event: any) {
    return event;
  },
});

export { Sentry };
