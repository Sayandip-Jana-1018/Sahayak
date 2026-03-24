import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';

import { healthRoutes } from './routes/health';
import { voiceDemoRoutes } from './routes/ai/voice-demo';
import { prescriptionOcrRoutes } from './routes/ai/prescription-ocr';
import { schemeFinderRoutes } from './routes/ai/scheme-finder';
import { companionRoutes } from './routes/ai/companion';
import { emotionRoutes } from './routes/ai/emotion';
import { dashboardOverviewRoutes } from './routes/dashboard/overview';
import { dashboardHealthRoutes } from './routes/dashboard/health';
import { medicationsRoutes } from './routes/medications/index';
import { medicationByIdRoutes } from './routes/medications/[id]';
import { sosTriggerRoutes } from './routes/sos/trigger';
import { remindersRoutes } from './routes/reminders/index';
import { profileRoutes } from './routes/profile/index';
import { demoRequestRoutes } from './routes/demo-request';
import { onboardingRoutes } from './routes/onboarding/complete';
import { smsRoutes } from './routes/sms/send-install-link';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
    trustProxy: true,
  });

  // ── Plugins ──
  await app.register(cors, {
    origin: [
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      /\.sahayak\.in$/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  await app.register(jwt, {
    secret: process.env.CLERK_SECRET_KEY || 'dev-secret-change-in-production',
  });

  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 1,
    },
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
    }),
  });

  // ── Auth decorator ──
  app.decorate('authenticate', async function (request: any, reply: any) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid or expired authentication token',
      });
    }
  });

  // ── Routes ──
  await app.register(healthRoutes, { prefix: '/api' });
  await app.register(voiceDemoRoutes, { prefix: '/api/ai' });
  await app.register(prescriptionOcrRoutes, { prefix: '/api/ai' });
  await app.register(schemeFinderRoutes, { prefix: '/api/ai' });
  await app.register(companionRoutes, { prefix: '/api/ai' });
  await app.register(emotionRoutes, { prefix: '/api/ai' });
  await app.register(dashboardOverviewRoutes, { prefix: '/api/dashboard' });
  await app.register(dashboardHealthRoutes, { prefix: '/api/dashboard' });
  await app.register(medicationsRoutes, { prefix: '/api' });
  await app.register(medicationByIdRoutes, { prefix: '/api' });
  await app.register(sosTriggerRoutes, { prefix: '/api/sos' });
  await app.register(remindersRoutes, { prefix: '/api' });
  await app.register(profileRoutes, { prefix: '/api' });
  await app.register(demoRequestRoutes, { prefix: '/api' });
  await app.register(onboardingRoutes, { prefix: '/api' });
  await app.register(smsRoutes, { prefix: '/api/sms' });

  // ── Error handler ──
  app.setErrorHandler((error, request, reply) => {
    const statusCode = error.statusCode || 500;

    app.log.error({
      err: error,
      req: { method: request.method, url: request.url },
    });

    reply.status(statusCode).send({
      statusCode,
      error: error.name || 'Internal Server Error',
      message:
        statusCode >= 500
          ? 'An unexpected error occurred. Our team has been notified.'
          : error.message,
    });
  });

  // ── 404 handler ──
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: `Route ${request.method} ${request.url} not found`,
    });
  });

  return app;
}
