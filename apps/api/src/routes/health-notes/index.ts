import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db, users, healthNotes, caregiverLinks, eq } from '@sahayak/db';
import { desc } from 'drizzle-orm';

export async function healthNotesRoutes(app: FastifyInstance) {
  // GET /api/health-notes
  app.get('/health-notes', async (request, reply) => {
    try {
      const clerkId = (request as any).user?.sub ?? (request as any).user?.userId;
      let elderlyProfileId: string | undefined;

      if (clerkId) {
        const [dbUser] = await db.select({ id: users.id }).from(users).where(eq(users.clerkId, clerkId)).limit(1);
        if (dbUser) {
          const [link] = await db.select({ elderlyProfileId: caregiverLinks.elderlyProfileId })
            .from(caregiverLinks).where(eq(caregiverLinks.caregiverId, dbUser.id)).limit(1);
          elderlyProfileId = link?.elderlyProfileId;
        }
      }

      const query = request.query as { elderlyProfileId?: string };
      if (query.elderlyProfileId) elderlyProfileId = query.elderlyProfileId;

      if (!elderlyProfileId) return reply.send({ notes: [] });

      const notes = await db.select({
        id: healthNotes.id,
        noteText: healthNotes.noteText,
        createdAt: healthNotes.createdAt,
        authorUserId: healthNotes.authorUserId,
      })
        .from(healthNotes)
        .where(eq(healthNotes.elderlyProfileId, elderlyProfileId))
        .orderBy(desc(healthNotes.createdAt))
        .limit(50);

      return reply.send({
        notes: notes.map((n) => ({ ...n, createdAt: n.createdAt?.toISOString() ?? null })),
      });
    } catch (err) {
      app.log.error({ err }, 'Health notes GET error');
      return reply.status(500).send({ statusCode: 500, error: 'Internal Server Error', message: 'Failed to fetch health notes' });
    }
  });

  // POST /api/health-notes
  app.post('/health-notes', async (request, reply) => {
    try {
      const clerkId = (request as any).user?.sub ?? (request as any).user?.userId;
      if (!clerkId) return reply.status(401).send({ statusCode: 401, error: 'Unauthorized' });

      const [dbUser] = await db.select({ id: users.id }).from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser) return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'User not found' });

      const body = z.object({
        elderlyProfileId: z.string().uuid(),
        noteText: z.string().min(1).max(2000),
      }).parse(request.body);

      // Verify caregiver access
      const [link] = await db.select({ id: caregiverLinks.id })
        .from(caregiverLinks)
        .where(eq(caregiverLinks.caregiverId, dbUser.id))
        .limit(1);
      if (!link) return reply.status(403).send({ statusCode: 403, error: 'Forbidden', message: 'Access denied' });

      const [note] = await db.insert(healthNotes).values({
        elderlyProfileId: body.elderlyProfileId,
        authorUserId: dbUser.id,
        noteText: body.noteText,
      }).returning();

      return reply.status(201).send({ ...note, createdAt: note.createdAt?.toISOString() ?? null });
    } catch (err) {
      if (err instanceof z.ZodError) return reply.status(400).send({ statusCode: 400, error: 'Validation Error', message: err.issues[0]?.message });
      app.log.error({ err }, 'Health note POST error');
      return reply.status(500).send({ statusCode: 500, error: 'Internal Server Error', message: 'Failed to save health note' });
    }
  });
}
