import type { FastifyInstance } from 'fastify';
import {
  db, users, organizations, aiUsageLogs, sosEvents, elderlyProfiles,
  voiceCommandLogs, eq, and, gte, lte, count, sql, isNull,
} from '@sahayak/db';

function extractClerkId(authHeader?: string): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const payload = JSON.parse(Buffer.from(authHeader.slice(7).split('.')[1], 'base64url').toString('utf8'));
    return payload.sub || null;
  } catch { return null; }
}

export async function adminOverviewRoutes(app: FastifyInstance) {
  app.get('/admin/overview', async (request, reply) => {
    try {
      const clerkId = extractClerkId(request.headers.authorization);
      if (!clerkId) return reply.status(401).send({ error: 'Unauthorized' });

      const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser || dbUser.role !== 'sys_admin') {
        return reply.status(403).send({ error: 'Forbidden — requires sys_admin role' });
      }

      // ── Aggregate stats ──
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const [totalUsers] = await db.select({ c: count() }).from(users);
      const [totalOrgs] = await db.select({ c: count() }).from(organizations);
      const [totalAiCalls] = await db.select({ c: count() })
        .from(aiUsageLogs)
        .where(gte(aiUsageLogs.createdAt, thirtyDaysAgo));
      const [activeSos] = await db.select({ c: count() })
        .from(sosEvents)
        .where(isNull(sosEvents.resolvedAt));
      const [totalElders] = await db.select({ c: count() }).from(elderlyProfiles);

      // ── 30-day growth data ──
      const growth: Array<{ date: string; users: number; commands: number }> = [];

      for (let i = 29; i >= 0; i--) {
        const dayStart = new Date();
        dayStart.setDate(dayStart.getDate() - i);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const [dayUsers] = await db.select({ c: count() })
          .from(users)
          .where(and(
            gte(users.createdAt, dayStart),
            lte(users.createdAt, dayEnd),
          ));

        const [dayCommands] = await db.select({ c: count() })
          .from(voiceCommandLogs)
          .where(and(
            gte(voiceCommandLogs.timestamp, dayStart),
            lte(voiceCommandLogs.timestamp, dayEnd),
          ));

        growth.push({
          date: dayStart.toISOString().slice(0, 10),
          users: Number(dayUsers?.c || 0),
          commands: Number(dayCommands?.c || 0),
        });
      }

      return reply.send({
        stats: {
          totalUsers: Number(totalUsers?.c || 0),
          totalOrgs: Number(totalOrgs?.c || 0),
          totalAiCalls: Number(totalAiCalls?.c || 0),
          activeSos: Number(activeSos?.c || 0),
          totalElders: Number(totalElders?.c || 0),
        },
        growth,
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Admin overview error');
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
}
