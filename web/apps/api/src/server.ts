import { buildApp } from './app';
import { startReminderWorker } from './workers/reminder.worker';
import { startSOSWorker } from './workers/sos.worker';
import { startLonelinessWorker } from './workers/loneliness.worker';

const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  const app = await buildApp();

  // ── Graceful shutdown ──
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, async () => {
      app.log.info(`Received ${signal}, shutting down gracefully...`);
      try {
        await app.close();
        app.log.info('Server closed successfully');
        process.exit(0);
      } catch (err) {
        app.log.error(err, 'Error during shutdown');
        process.exit(1);
      }
    });
  }

  // ── Uncaught error handlers ──
  process.on('unhandledRejection', (err) => {
    app.log.error(err, 'Unhandled rejection');
  });

  process.on('uncaughtException', (err) => {
    app.log.fatal(err, 'Uncaught exception — shutting down');
    process.exit(1);
  });

  // ── Start ──
  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`🚀 Sahayak API running on http://${HOST}:${PORT}`);

    // ── Start BullMQ workers & cron jobs ──
    startReminderWorker();
    startSOSWorker();
    startLonelinessWorker();
    app.log.info('🔧 All workers and cron jobs initialized');
  } catch (err) {
    app.log.fatal(err, 'Failed to start server');
    process.exit(1);
  }
}

start();
