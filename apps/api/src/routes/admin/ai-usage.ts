import type { FastifyInstance } from 'fastify';
import { db, users, aiUsageLogs, eq, gte, desc, count, sql } from '@sahayak/db';

function extractClerkId(authHeader?: string): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const payload = JSON.parse(Buffer.from(authHeader.slice(7).split('.')[1], 'base64url').toString('utf8'));
    return payload.sub || null;
  } catch { return null; }
}

export async function adminAiUsageRoutes(app: FastifyInstance) {
  app.get('/admin/ai-usage', async (request, reply) => {
    try {
      const clerkId = extractClerkId(request.headers.authorization);
      if (!clerkId) return reply.status(401).send({ error: 'Unauthorized' });

      const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser || dbUser.role !== 'sys_admin') {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const { range } = request.query as { range?: string };
      const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Per-feature breakdown
      const byFeature = await db.select({
        feature: aiUsageLogs.feature,
        totalCalls: count(),
        totalTokens: sql<number>`COALESCE(SUM(${aiUsageLogs.tokensUsed}), 0)`,
        avgProcessingMs: sql<number>`COALESCE(AVG(${aiUsageLogs.processingMs}), 0)`,
      })
        .from(aiUsageLogs)
        .where(gte(aiUsageLogs.createdAt, since))
        .groupBy(aiUsageLogs.feature);

      // Total stats
      const totalCalls = byFeature.reduce((sum, f) => sum + Number(f.totalCalls), 0);
      const totalTokens = byFeature.reduce((sum, f) => sum + Number(f.totalTokens), 0);

      // Daily breakdown
      const daily = await db.select({
        date: sql<string>`DATE(${aiUsageLogs.createdAt})`,
        calls: count(),
        tokens: sql<number>`COALESCE(SUM(${aiUsageLogs.tokensUsed}), 0)`,
      })
        .from(aiUsageLogs)
        .where(gte(aiUsageLogs.createdAt, since))
        .groupBy(sql`DATE(${aiUsageLogs.createdAt})`)
        .orderBy(sql`DATE(${aiUsageLogs.createdAt})`);

      // Per-language breakdown
      const byLanguage = await db.select({
        language: aiUsageLogs.language,
        calls: count(),
      })
        .from(aiUsageLogs)
        .where(gte(aiUsageLogs.createdAt, since))
        .groupBy(aiUsageLogs.language)
        .orderBy(desc(count()));

      return reply.send({
        totalCalls,
        totalTokens,
        estimatedCost: (totalTokens / 1000) * 0.0005, // rough Gemini estimate
        byFeature: byFeature.map(f => ({
          feature: f.feature,
          calls: Number(f.totalCalls),
          tokens: Number(f.totalTokens),
          avgMs: Math.round(Number(f.avgProcessingMs)),
        })),
        daily: daily.map(d => ({
          date: d.date,
          calls: Number(d.calls),
          tokens: Number(d.tokens),
        })),
        byLanguage: byLanguage.map(l => ({
          language: l.language || 'unknown',
          calls: Number(l.calls),
        })),
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Admin AI usage error');
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
}
