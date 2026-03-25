import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db, users, deviceRegistrations, elderlyProfiles, caregiverLinks, eq } from '@sahayak/db';
import { emitToCaregiver } from '../../plugins/socket';
import { randomBytes } from 'node:crypto';

export async function deviceRoutes(app: FastifyInstance) {
  // POST /api/device/register — called by APK on first launch
  app.post('/device/register', async (request, reply) => {
    try {
      const body = z.object({
        elderlyProfileId: z.string().uuid(),
        deviceModel: z.string().optional(),
        androidVersion: z.string().optional(),
        appVersion: z.string().optional(),
        fcmToken: z.string().optional(),
        // Device authenticates via x-device-key header OR by creating a new key
        deviceKey: z.string().optional(),
      }).parse(request.body);

      const { elderlyProfileId } = body;

      // Verify profile exists
      const [profile] = await db.select({ id: elderlyProfiles.id, name: elderlyProfiles.name })
        .from(elderlyProfiles).where(eq(elderlyProfiles.id, elderlyProfileId)).limit(1);
      if (!profile) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: 'Elderly profile not found' });

      // Upsert device registration
      const deviceKey = body.deviceKey ?? randomBytes(32).toString('hex');
      const existing = await db.select({ id: deviceRegistrations.id })
        .from(deviceRegistrations)
        .where(eq(deviceRegistrations.elderlyProfileId, elderlyProfileId))
        .limit(1);

      let deviceRecord;
      if (existing.length > 0) {
        const [updated] = await db.update(deviceRegistrations)
          .set({
            deviceModel: body.deviceModel,
            androidVersion: body.androidVersion,
            appVersion: body.appVersion,
            fcmToken: body.fcmToken,
            lastPingAt: new Date(),
          })
          .where(eq(deviceRegistrations.elderlyProfileId, elderlyProfileId))
          .returning();
        deviceRecord = updated;
      } else {
        const [created] = await db.insert(deviceRegistrations).values({
          elderlyProfileId,
          deviceKey,
          deviceModel: body.deviceModel,
          androidVersion: body.androidVersion,
          appVersion: body.appVersion,
          fcmToken: body.fcmToken,
          lastPingAt: new Date(),
        }).returning();
        deviceRecord = created;
      }

      // Also update elderlyProfile deviceId
      await db.update(elderlyProfiles)
        .set({ deviceId: deviceRecord.deviceKey, lastActiveAt: new Date() })
        .where(eq(elderlyProfiles.id, elderlyProfileId));

      // Notify caregivers
      emitToCaregiver(elderlyProfileId, 'device_registered', {
        elderlyProfileId,
        name: profile.name,
        deviceKey: deviceRecord.deviceKey,
        registeredAt: new Date().toISOString(),
      });

      return reply.status(201).send({
        deviceKey: deviceRecord.deviceKey,
        registered: true,
        elderlyProfileId,
      });
    } catch (err) {
      app.log.error({ err }, 'Device register error');
      if (err instanceof z.ZodError) return reply.status(400).send({ statusCode: 400, error: 'Validation Error', message: err.issues[0]?.message });
      return reply.status(500).send({ statusCode: 500, error: 'Internal Server Error', message: 'Failed to register device' });
    }
  });

  // GET /api/device/status/:elderlyProfileId
  app.get('/device/status/:elderlyProfileId', async (request, reply) => {
    try {
      const { elderlyProfileId } = request.params as { elderlyProfileId: string };
      const clerkId = (request as any).user?.sub ?? (request as any).user?.userId;

      if (clerkId) {
        const [dbUser] = await db.select({ id: users.id }).from(users).where(eq(users.clerkId, clerkId)).limit(1);
        if (dbUser) {
          const [link] = await db.select({ id: caregiverLinks.id })
            .from(caregiverLinks)
            .where(eq(caregiverLinks.caregiverId, dbUser.id))
            .limit(1);
          if (!link) return reply.status(403).send({ statusCode: 403, error: 'Forbidden', message: 'Access denied' });
        }
      }

      const [device] = await db.select()
        .from(deviceRegistrations)
        .where(eq(deviceRegistrations.elderlyProfileId, elderlyProfileId))
        .limit(1);

      const [profile] = await db.select({ batteryLevel: elderlyProfiles.batteryLevel, lastActiveAt: elderlyProfiles.lastActiveAt })
        .from(elderlyProfiles).where(eq(elderlyProfiles.id, elderlyProfileId)).limit(1);

      const lastPing = device?.lastPingAt ? new Date(device.lastPingAt) : null;
      const isConnected = lastPing ? (Date.now() - lastPing.getTime()) < 5 * 60 * 1000 : false;

      return reply.send({
        isConnected,
        lastSeen: device?.lastPingAt?.toISOString() ?? null,
        deviceId: device?.id ?? null,
        deviceKey: device?.deviceKey ?? null,
        batteryLevel: profile?.batteryLevel ?? null,
        lastActiveAt: profile?.lastActiveAt?.toISOString() ?? null,
      });
    } catch (err) {
      app.log.error({ err }, 'Device status error');
      return reply.status(500).send({ statusCode: 500, error: 'Internal Server Error', message: 'Failed to get device status' });
    }
  });

  // POST /api/device/request-location
  app.post('/device/request-location', async (request, reply) => {
    try {
      const { elderlyProfileId } = z.object({ elderlyProfileId: z.string().uuid() }).parse(request.body);
      const clerkId = (request as any).user?.sub ?? (request as any).user?.userId;
      if (!clerkId) return reply.status(401).send({ statusCode: 401, error: 'Unauthorized' });

      // Emit to the device room (APK listens on `device:{elderlyProfileId}`)
      const { getIO } = await import('../../plugins/socket');
      getIO()?.to(`device:${elderlyProfileId}`).emit('request_location', { elderlyProfileId });

      return reply.send({ sent: true });
    } catch (err) {
      app.log.error({ err }, 'Request location error');
      return reply.status(500).send({ statusCode: 500, error: 'Internal Server Error', message: 'Failed to request location' });
    }
  });
}
