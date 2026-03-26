import type { FastifyInstance } from 'fastify';
import { db, users, voiceCommandLogs, eq, gte, desc, count, sql } from '@sahayak/db';

function extractClerkId(authHeader?: string): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const payload = JSON.parse(Buffer.from(authHeader.slice(7).split('.')[1], 'base64url').toString('utf8'));
    return payload.sub || null;
  } catch { return null; }
}

export async function studioAnalyticsRoutes(app: FastifyInstance) {
  app.get('/studio/analytics', async (request, reply) => {
    try {
      const clerkId = extractClerkId(request.headers.authorization);
      if (!clerkId) return reply.status(401).send({ error: 'Unauthorized' });

      const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser || (dbUser.role !== 'ngo_admin' && dbUser.role !== 'sys_admin')) {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const { range } = request.query as { range?: string };
      const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Daily voice command counts
      const daily = await db.select({
        date: sql<string>`DATE(${voiceCommandLogs.timestamp})`,
        total: count(),
        successful: sql<number>`SUM(CASE WHEN ${voiceCommandLogs.wasSuccessful} = true THEN 1 ELSE 0 END)`,
      })
        .from(voiceCommandLogs)
        .where(gte(voiceCommandLogs.timestamp, since))
        .groupBy(sql`DATE(${voiceCommandLogs.timestamp})`)
        .orderBy(sql`DATE(${voiceCommandLogs.timestamp})`);

      // Top intents
      const topIntents = await db.select({
        intent: voiceCommandLogs.detectedIntent,
        total: count(),
      })
        .from(voiceCommandLogs)
        .where(gte(voiceCommandLogs.timestamp, since))
        .groupBy(voiceCommandLogs.detectedIntent)
        .orderBy(desc(count()))
        .limit(10);

      // Language distribution
      const byLanguage = await db.select({
        language: voiceCommandLogs.language,
        total: count(),
      })
        .from(voiceCommandLogs)
        .where(gte(voiceCommandLogs.timestamp, since))
        .groupBy(voiceCommandLogs.language)
        .orderBy(desc(count()));

      // Average confidence and processing time
      const [avgStats] = await db.select({
        avgConfidence: sql<number>`COALESCE(AVG(${voiceCommandLogs.confidenceScore}::numeric), 0)`,
        avgProcessingMs: sql<number>`COALESCE(AVG(${voiceCommandLogs.processingMs}), 0)`,
        totalCommands: count(),
      })
        .from(voiceCommandLogs)
        .where(gte(voiceCommandLogs.timestamp, since));

      return reply.send({
        totalCommands: Number(avgStats?.totalCommands || 0),
        avgConfidence: Math.round(Number(avgStats?.avgConfidence || 0) * 100) / 100,
        avgProcessingMs: Math.round(Number(avgStats?.avgProcessingMs || 0)),
        daily: daily.map(d => ({
          date: d.date,
          total: Number(d.total),
          successful: Number(d.successful || 0),
        })),
        topIntents: topIntents.map(i => ({
          intent: i.intent || 'unknown',
          count: Number(i.total),
        })),
        byLanguage: byLanguage.map(l => ({
          language: l.language || 'unknown',
          count: Number(l.total),
        })),
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Studio analytics error');
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
}
