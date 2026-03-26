import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db, desc, eq, healthNotes } from '@sahayak/db';
import { getFirstLinkedProfileId, requireCaregiverAccess, requireDbUser } from '../../lib/auth';

export async function healthNotesRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  app.get('/health-notes', { preHandler: auth }, async (request, reply) => {
    try {
      const dbUser = await requireDbUser(request, reply);
      if (!dbUser) return;

      const query = request.query as { elderlyProfileId?: string };
      const elderlyProfileId = query.elderlyProfileId ?? await getFirstLinkedProfileId(dbUser.id);
      const access = await requireCaregiverAccess(request, reply, elderlyProfileId);
      if (!access) return;

      const notes = await db.select({
        id: healthNotes.id,
        noteText: healthNotes.noteText,
        createdAt: healthNotes.createdAt,
        authorUserId: healthNotes.authorUserId,
      })
        .from(healthNotes)
        .where(eq(healthNotes.elderlyProfileId, access.link.elderlyProfileId))
        .orderBy(desc(healthNotes.createdAt))
        .limit(50);

      return reply.send({
        notes: notes.map((note) => ({
          ...note,
          createdAt: note.createdAt?.toISOString() ?? null,
        })),
      });
    } catch (err) {
      request.log.error({ err }, 'Health notes GET error');
      return reply.status(500).send({ statusCode: 500, error: 'Internal Server Error', message: 'Failed to fetch health notes' });
    }
  });

  app.post('/health-notes', { preHandler: auth }, async (request, reply) => {
    try {
      const dbUser = await requireDbUser(request, reply);
      if (!dbUser) return;

      const body = z.object({
        elderlyProfileId: z.string().uuid(),
        noteText: z.string().min(1).max(2000),
      }).parse(request.body);

      const access = await requireCaregiverAccess(request, reply, body.elderlyProfileId);
      if (!access) return;

      const [note] = await db.insert(healthNotes).values({
        elderlyProfileId: body.elderlyProfileId,
        authorUserId: dbUser.id,
        noteText: body.noteText,
      }).returning();

      return reply.status(201).send({
        ...note,
        createdAt: note.createdAt?.toISOString() ?? null,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({ statusCode: 400, error: 'Validation Error', message: err.issues[0]?.message });
      }
      request.log.error({ err }, 'Health note POST error');
      return reply.status(500).send({ statusCode: 500, error: 'Internal Server Error', message: 'Failed to save health note' });
    }
  });
}
