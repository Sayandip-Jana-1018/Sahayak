import type { FastifyInstance } from 'fastify';
import { db, users, elderlyProfiles, caregiverLinks, voiceCommandLogs, sosEvents, eq, sql, count, gte } from '@sahayak/db';
import { deviceRegistrations } from '@sahayak/db';

function extractClerkId(authHeader?: string): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const payload = JSON.parse(Buffer.from(authHeader.slice(7).split('.')[1], 'base64url').toString('utf8'));
    return payload.sub || null;
  } catch { return null; }
}

export async function studioOverviewRoutes(app: FastifyInstance) {
  app.get('/studio/overview', async (request, reply) => {
    try {
      const clerkId = extractClerkId(request.headers.authorization);
      if (!clerkId) return reply.status(401).send({ error: 'Unauthorized' });

      const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser || (dbUser.role !== 'ngo_admin' && dbUser.role !== 'sys_admin')) {
        return reply.status(403).send({ error: 'Forbidden — requires ngo_admin role' });
      }

      // Count devices, elders, recent voice commands
      const today = new Date(); today.setHours(0, 0, 0, 0);

      const [totalDevices] = await db.select({ c: count() }).from(deviceRegistrations);
      const [activeDevices] = await db.select({ c: count() }).from(deviceRegistrations).where(eq(deviceRegistrations.isActive, true));
      const [totalElders] = await db.select({ c: count() }).from(elderlyProfiles);
      const [voiceToday] = await db.select({ c: count() }).from(voiceCommandLogs).where(gte(voiceCommandLogs.timestamp, today));

      return reply.send({
        orgName: dbUser.role === 'ngo_admin' ? 'Organization Panel' : 'Admin View',
        stats: {
          totalDevices: totalDevices?.c || 0,
          activeDevices: activeDevices?.c || 0,
          totalElders: totalElders?.c || 0,
          voiceCommandsToday: voiceToday?.c || 0,
        },
        recentAlerts: [],
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Studio overview error');
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
}
