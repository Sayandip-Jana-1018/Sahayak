import type { FastifyInstance } from 'fastify';
import { db, users, sosEvents, elderlyProfiles, eq, desc, gte, isNull, and } from '@sahayak/db';

function extractClerkId(authHeader?: string): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const payload = JSON.parse(Buffer.from(authHeader.slice(7).split('.')[1], 'base64url').toString('utf8'));
    return payload.sub || null;
  } catch { return null; }
}

export async function adminSosEventsRoutes(app: FastifyInstance) {
  app.get('/admin/sos-events', async (request, reply) => {
    try {
      const clerkId = extractClerkId(request.headers.authorization);
      if (!clerkId) return reply.status(401).send({ error: 'Unauthorized' });

      const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser || dbUser.role !== 'sys_admin') {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const { status } = request.query as { status?: string };

      let query = db.select({
        id: sosEvents.id,
        elderlyProfileId: sosEvents.elderlyProfileId,
        elderName: elderlyProfiles.name,
        triggerType: sosEvents.triggerType,
        severity: sosEvents.severity,
        locationLat: sosEvents.locationLat,
        locationLng: sosEvents.locationLng,
        triggeredAt: sosEvents.triggeredAt,
        resolvedAt: sosEvents.resolvedAt,
        smsCount: sosEvents.smsCount,
        notes: sosEvents.notes,
      })
        .from(sosEvents)
        .leftJoin(elderlyProfiles, eq(sosEvents.elderlyProfileId, elderlyProfiles.id))
        .orderBy(desc(sosEvents.triggeredAt))
        .limit(100)
        .$dynamic();

      if (status === 'active') {
        query = query.where(isNull(sosEvents.resolvedAt));
      } else if (status === 'resolved') {
        query = query.where(
          // resolvedAt IS NOT NULL
          and(
            gte(sosEvents.resolvedAt, new Date('2000-01-01'))
          )
        );
      }

      const events = await query;

      return reply.send({
        events: events.map(e => ({
          ...e,
          triggeredAt: e.triggeredAt?.toISOString() || null,
          resolvedAt: e.resolvedAt?.toISOString() || null,
          locationLat: e.locationLat ? parseFloat(e.locationLat) : null,
          locationLng: e.locationLng ? parseFloat(e.locationLng) : null,
        })),
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Admin SOS events error');
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
}
