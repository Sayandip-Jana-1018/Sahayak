import type { FastifyInstance } from 'fastify';
import { db, users, eq } from '@sahayak/db';
import os from 'os';

function extractClerkId(authHeader?: string): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const payload = JSON.parse(Buffer.from(authHeader.slice(7).split('.')[1], 'base64url').toString('utf8'));
    return payload.sub || null;
  } catch { return null; }
}

export async function adminSystemHealthRoutes(app: FastifyInstance) {
  app.get('/admin/system-health', async (request, reply) => {
    try {
      const clerkId = extractClerkId(request.headers.authorization);
      if (!clerkId) return reply.status(401).send({ error: 'Unauthorized' });

      const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser || dbUser.role !== 'sys_admin') {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const memUsage = process.memoryUsage();
      const cpus = os.cpus();
      const loadAvg = os.loadavg();

      // Check DB connectivity
      let dbStatus = 'healthy';
      let dbLatencyMs = 0;
      try {
        const start = Date.now();
        await db.select({ id: users.id }).from(users).limit(1);
        dbLatencyMs = Date.now() - start;
      } catch {
        dbStatus = 'unhealthy';
      }

      return reply.send({
        status: 'operational',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        services: [
          {
            name: 'API Server',
            status: 'healthy',
            details: {
              nodeVersion: process.version,
              platform: process.platform,
              pid: process.pid,
            },
          },
          {
            name: 'Database',
            status: dbStatus,
            details: { latencyMs: dbLatencyMs },
          },
          {
            name: 'Memory',
            status: memUsage.heapUsed / memUsage.heapTotal < 0.9 ? 'healthy' : 'warning',
            details: {
              heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
              heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
              rssMB: Math.round(memUsage.rss / 1024 / 1024),
            },
          },
        ],
        system: {
          cpuCores: cpus.length,
          cpuModel: cpus[0]?.model || 'unknown',
          loadAvg: loadAvg.map(l => Math.round(l * 100) / 100),
          totalMemoryMB: Math.round(os.totalmem() / 1024 / 1024),
          freeMemoryMB: Math.round(os.freemem() / 1024 / 1024),
        },
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Admin system health error');
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
}
