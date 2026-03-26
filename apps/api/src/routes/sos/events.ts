import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { count, db, desc, eq, sosEvents } from '@sahayak/db';
import { emitToCaregiver } from '../../plugins/socket';
import { getFirstLinkedProfileId, requireCaregiverAccess, requireDbUser } from '../../lib/auth';

const querySchema = z.object({
  elderlyProfileId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

async function listSosEvents(request: any, reply: any) {
  try {
    const query = querySchema.parse(request.query);
    const access = await requireCaregiverAccess(
      request,
      reply,
      query.elderlyProfileId ?? await getFirstLinkedProfileId(request.userDb.id),
    );
    if (!access) return;

    const elderlyProfileId = access.link.elderlyProfileId;
    const offset = (query.page - 1) * query.limit;

    const [events, totalResult] = await Promise.all([
      db.select()
        .from(sosEvents)
        .where(eq(sosEvents.elderlyProfileId, elderlyProfileId))
        .orderBy(desc(sosEvents.triggeredAt))
        .limit(query.limit)
        .offset(offset),
      db.select({ cnt: count() })
        .from(sosEvents)
        .where(eq(sosEvents.elderlyProfileId, elderlyProfileId)),
    ]);

    return reply.send({
      events: events.map((event) => ({
        ...event,
        triggeredAt: event.triggeredAt?.toISOString() ?? null,
        resolvedAt: event.resolvedAt?.toISOString() ?? null,
      })),
      total: Number(totalResult[0]?.cnt ?? 0),
      page: query.page,
      limit: query.limit,
    });
  } catch (err) {
    request.log.error({ err }, 'SOS events list error');
    return reply.status(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Failed to fetch SOS events',
    });
  }
}

async function resolveSosEvent(request: any, reply: any) {
  try {
    const { id } = request.params as { id: string };

    const [event] = await db.select().from(sosEvents).where(eq(sosEvents.id, id)).limit(1);
    if (!event) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'SOS event not found',
      });
    }

    const access = await requireCaregiverAccess(request, reply, event.elderlyProfileId);
    if (!access) return;

    const [updated] = await db
      .update(sosEvents)
      .set({
        resolvedAt: new Date(),
        resolvedByUserId: access.dbUser.id,
      })
      .where(eq(sosEvents.id, id))
      .returning();

    emitToCaregiver(event.elderlyProfileId, 'sos_resolved', {
      sosEventId: id,
      elderlyProfileId: event.elderlyProfileId,
      resolvedAt: updated.resolvedAt?.toISOString() ?? new Date().toISOString(),
      resolvedByUserId: access.dbUser.id,
    });

    return reply.send({
      resolved: true,
      resolvedAt: updated.resolvedAt?.toISOString() ?? null,
    });
  } catch (err) {
    request.log.error({ err }, 'SOS resolve error');
    return reply.status(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Failed to resolve SOS event',
    });
  }
}

export async function sosEventsRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  app.get('/sos-events', { preHandler: auth }, async (request, reply) => {
    const dbUser = await requireDbUser(request, reply);
    if (!dbUser) return;
    (request as any).userDb = dbUser;
    return listSosEvents(request, reply);
  });

  app.get('/sos/events', { preHandler: auth }, async (request, reply) => {
    const dbUser = await requireDbUser(request, reply);
    if (!dbUser) return;
    (request as any).userDb = dbUser;
    return listSosEvents(request, reply);
  });

  app.put('/sos-events/:id/resolve', { preHandler: auth }, async (request, reply) => {
    return resolveSosEvent(request, reply);
  });

  app.put('/sos/events/:id/resolve', { preHandler: auth }, async (request, reply) => {
    return resolveSosEvent(request, reply);
  });
}
