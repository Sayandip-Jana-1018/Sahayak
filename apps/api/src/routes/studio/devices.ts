import type { FastifyInstance } from 'fastify';
import { db, users, deviceRegistrations, elderlyProfiles, eq, desc } from '@sahayak/db';

function extractClerkId(authHeader?: string): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const payload = JSON.parse(Buffer.from(authHeader.slice(7).split('.')[1], 'base64url').toString('utf8'));
    return payload.sub || null;
  } catch { return null; }
}

export async function studioDevicesRoutes(app: FastifyInstance) {
  app.get('/studio/devices', async (request, reply) => {
    try {
      const clerkId = extractClerkId(request.headers.authorization);
      if (!clerkId) return reply.status(401).send({ error: 'Unauthorized' });

      const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser || (dbUser.role !== 'ngo_admin' && dbUser.role !== 'sys_admin')) {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const devices = await db.select({
        id: deviceRegistrations.id,
        elderlyProfileId: deviceRegistrations.elderlyProfileId,
        elderName: elderlyProfiles.name,
        deviceKey: deviceRegistrations.deviceKey,
        deviceModel: deviceRegistrations.deviceModel,
        androidVersion: deviceRegistrations.androidVersion,
        appVersion: deviceRegistrations.appVersion,
        isActive: deviceRegistrations.isActive,
        lastPingAt: deviceRegistrations.lastPingAt,
        createdAt: deviceRegistrations.createdAt,
      })
        .from(deviceRegistrations)
        .leftJoin(elderlyProfiles, eq(deviceRegistrations.elderlyProfileId, elderlyProfiles.id))
        .orderBy(desc(deviceRegistrations.createdAt));

      return reply.send({
        devices: devices.map(d => ({
          ...d,
          lastPingAt: d.lastPingAt?.toISOString() || null,
          createdAt: d.createdAt?.toISOString() || null,
        })),
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Studio devices error');
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
}
