import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db, users, sosEvents, caregiverLinks, elderlyProfiles, eq, and, desc, count, sql } from '@sahayak/db';
import { emitToCaregiver } from '../../plugins/socket';

const querySchema = z.object({
  elderlyProfileId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function sosEventsRoutes(app: FastifyInstance) {
  // GET /api/sos-events — paginated list
  app.get('/sos-events', async (request, reply) => {
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

      const query = querySchema.parse(request.query);
      if (query.elderlyProfileId) elderlyProfileId = query.elderlyProfileId;

      if (!elderlyProfileId) {
        return reply.send({ events: [], total: 0 });
      }

      const offset = (query.page - 1) * query.limit;

      const [events, totalResult] = await Promise.all([
        db.select().from(sosEvents)
          .where(eq(sosEvents.elderlyProfileId, elderlyProfileId))
          .orderBy(desc(sosEvents.triggeredAt))
          .limit(query.limit)
          .offset(offset),
        db.select({ cnt: count() }).from(sosEvents)
          .where(eq(sosEvents.elderlyProfileId, elderlyProfileId)),
      ]);

      return reply.send({
        events: events.map((e) => ({
          ...e,
          triggeredAt: e.triggeredAt?.toISOString() ?? null,
          resolvedAt: e.resolvedAt?.toISOString() ?? null,
        })),
        total: Number(totalResult[0]?.cnt ?? 0),
        page: query.page,
        limit: query.limit,
      });
    } catch (err) {
      app.log.error({ err }, 'SOS events list error');
      return reply.status(500).send({ statusCode: 500, error: 'Internal Server Error', message: 'Failed to fetch SOS events' });
    }
  });

  // PUT /api/sos-events/:id/resolve
  app.put('/sos-events/:id/resolve', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const clerkId = (request as any).user?.sub ?? (request as any).user?.userId;

      if (!clerkId) return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'No session' });

      const [dbUser] = await db.select({ id: users.id }).from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser) return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'User not found' });

      const [event] = await db.select().from(sosEvents).where(eq(sosEvents.id, id)).limit(1);
      if (!event) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: 'SOS event not found' });

      // Verify caregiver access
      const [link] = await db.select({ id: caregiverLinks.id })
        .from(caregiverLinks)
        .where(and(
          eq(caregiverLinks.caregiverId, dbUser.id),
          eq(caregiverLinks.elderlyProfileId, event.elderlyProfileId),
        ))
        .limit(1);

      if (!link) return reply.status(403).send({ statusCode: 403, error: 'Forbidden', message: 'Access denied' });

      const [updated] = await db
        .update(sosEvents)
        .set({
          resolvedAt: new Date(),
          resolvedByUserId: dbUser.id,
        })
        .where(eq(sosEvents.id, id))
        .returning();

      emitToCaregiver(event.elderlyProfileId, 'sos_resolved', {
        sosEventId: id,
        resolvedAt: updated.resolvedAt?.toISOString(),
        resolvedByUserId: dbUser.id,
      });

      return reply.send({ resolved: true, resolvedAt: updated.resolvedAt?.toISOString() });
    } catch (err) {
      app.log.error({ err }, 'SOS resolve error');
      return reply.status(500).send({ statusCode: 500, error: 'Internal Server Error', message: 'Failed to resolve SOS event' });
    }
  });
}
