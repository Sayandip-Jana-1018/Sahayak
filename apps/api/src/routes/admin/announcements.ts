import type { FastifyInstance } from 'fastify';
import { db, users, announcements, eq, desc } from '@sahayak/db';

function extractClerkId(authHeader?: string): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const payload = JSON.parse(Buffer.from(authHeader.slice(7).split('.')[1], 'base64url').toString('utf8'));
    return payload.sub || null;
  } catch { return null; }
}

export async function adminAnnouncementsRoutes(app: FastifyInstance) {
  // GET — list announcements
  app.get('/admin/announcements', async (request, reply) => {
    try {
      const clerkId = extractClerkId(request.headers.authorization);
      if (!clerkId) return reply.status(401).send({ error: 'Unauthorized' });

      const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser || dbUser.role !== 'sys_admin') {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const allAnnouncements = await db.select({
        id: announcements.id,
        title: announcements.title,
        body: announcements.body,
        target: announcements.target,
        priority: announcements.priority,
        expiresAt: announcements.expiresAt,
        createdAt: announcements.createdAt,
        createdByUserId: announcements.createdByUserId,
      })
        .from(announcements)
        .orderBy(desc(announcements.createdAt))
        .limit(100);

      return reply.send({
        announcements: allAnnouncements.map(a => ({
          ...a,
          createdAt: a.createdAt?.toISOString() || null,
          expiresAt: a.expiresAt?.toISOString() || null,
        })),
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Admin announcements error');
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  // POST — create announcement
  app.post('/admin/announcements', async (request, reply) => {
    try {
      const clerkId = extractClerkId(request.headers.authorization);
      if (!clerkId) return reply.status(401).send({ error: 'Unauthorized' });

      const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser || dbUser.role !== 'sys_admin') {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const body = request.body as {
        title: string; body: string;
        target?: string; priority?: string; expiresAt?: string;
      };

      if (!body.title || !body.body) {
        return reply.status(400).send({ error: 'Title and body are required' });
      }

      const [created] = await db.insert(announcements).values({
        title: body.title,
        body: body.body,
        target: body.target || 'all',
        priority: body.priority || 'info',
        createdByUserId: dbUser.id,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      }).returning();

      return reply.status(201).send({
        announcement: {
          ...created,
          createdAt: created.createdAt?.toISOString() || null,
          expiresAt: created.expiresAt?.toISOString() || null,
        },
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Admin create announcement error');
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
}
