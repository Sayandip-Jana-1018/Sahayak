import { randomBytes } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { caregiverLinks, db, deviceRegistrations, elderlyProfiles, eq } from '@sahayak/db';
import { emitToCaregiver, getIO } from '../../plugins/socket';
import { getFirstLinkedProfileId, requireCaregiverAccess, requireDbUser } from '../../lib/auth';

const registerSchema = z.object({
  elderlyProfileId: z.string().uuid(),
  deviceModel: z.string().optional(),
  androidVersion: z.string().optional(),
  appVersion: z.string().optional(),
  fcmToken: z.string().optional(),
  deviceKey: z.string().optional(),
});

const heartbeatSchema = z.object({
  batteryLevel: z.number().int().min(0).max(100).optional(),
  lastLocationLat: z.number().min(-90).max(90).optional(),
  lastLocationLng: z.number().min(-180).max(180).optional(),
});

export async function deviceRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  app.post('/device/register', async (request, reply) => {
    try {
      const body = registerSchema.parse(request.body);

      const [profile] = await db.select({
        id: elderlyProfiles.id,
        name: elderlyProfiles.name,
      }).from(elderlyProfiles)
        .where(eq(elderlyProfiles.id, body.elderlyProfileId))
        .limit(1);

      if (!profile) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Elderly profile not found',
        });
      }

      const deviceKey = body.deviceKey ?? randomBytes(32).toString('hex');
      const [existing] = await db.select({ id: deviceRegistrations.id })
        .from(deviceRegistrations)
        .where(eq(deviceRegistrations.elderlyProfileId, body.elderlyProfileId))
        .limit(1);

      const [deviceRecord] = existing
        ? await db.update(deviceRegistrations)
            .set({
              deviceModel: body.deviceModel,
              androidVersion: body.androidVersion,
              appVersion: body.appVersion,
              fcmToken: body.fcmToken,
              lastPingAt: new Date(),
              isActive: true,
            })
            .where(eq(deviceRegistrations.elderlyProfileId, body.elderlyProfileId))
            .returning()
        : await db.insert(deviceRegistrations).values({
            elderlyProfileId: body.elderlyProfileId,
            deviceKey,
            deviceModel: body.deviceModel,
            androidVersion: body.androidVersion,
            appVersion: body.appVersion,
            fcmToken: body.fcmToken,
            lastPingAt: new Date(),
            isActive: true,
          }).returning();

      await db.update(elderlyProfiles)
        .set({
          deviceId: deviceRecord.deviceKey,
          lastActiveAt: new Date(),
        })
        .where(eq(elderlyProfiles.id, body.elderlyProfileId));

      emitToCaregiver(body.elderlyProfileId, 'device_registered', {
        elderlyProfileId: body.elderlyProfileId,
        name: profile.name,
        deviceKey: deviceRecord.deviceKey,
        registeredAt: new Date().toISOString(),
      });

      return reply.status(201).send({
        deviceKey: deviceRecord.deviceKey,
        registered: true,
        elderlyProfileId: body.elderlyProfileId,
      });
    } catch (err) {
      request.log.error({ err }, 'Device register error');
      if (err instanceof z.ZodError) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Validation Error',
          message: err.issues[0]?.message,
        });
      }

      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to register device',
      });
    }
  });

  app.get('/device/status', { preHandler: auth }, async (request, reply) => {
    try {
      const dbUser = await requireDbUser(request, reply);
      if (!dbUser) return;

      const query = request.query as { check?: string };
      if (query.check !== 'latest') {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Unsupported device status query',
        });
      }

      const elderlyProfileId = await getFirstLinkedProfileId(dbUser.id);
      if (!elderlyProfileId) {
        return reply.send({ registered: false });
      }

      const [device] = await db.select()
        .from(deviceRegistrations)
        .where(eq(deviceRegistrations.elderlyProfileId, elderlyProfileId))
        .limit(1);

      return reply.send({
        registered: Boolean(device),
        deviceKey: device?.deviceKey ?? null,
        elderlyProfileId,
      });
    } catch (err) {
      request.log.error({ err }, 'Latest device status error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to get device status',
      });
    }
  });

  app.get('/device/status/:elderlyProfileId', { preHandler: auth }, async (request, reply) => {
    try {
      const { elderlyProfileId } = request.params as { elderlyProfileId: string };
      const access = await requireCaregiverAccess(request, reply, elderlyProfileId);
      if (!access) return;

      const [device] = await db.select()
        .from(deviceRegistrations)
        .where(eq(deviceRegistrations.elderlyProfileId, elderlyProfileId))
        .limit(1);

      const [profile] = await db.select({
        batteryLevel: elderlyProfiles.batteryLevel,
        lastActiveAt: elderlyProfiles.lastActiveAt,
      }).from(elderlyProfiles)
        .where(eq(elderlyProfiles.id, elderlyProfileId))
        .limit(1);

      const lastPing = device?.lastPingAt ? new Date(device.lastPingAt) : null;
      const isConnected = lastPing ? (Date.now() - lastPing.getTime()) < 15 * 60 * 1000 : false;

      return reply.send({
        isConnected,
        lastSeen: device?.lastPingAt?.toISOString() ?? null,
        deviceId: device?.id ?? null,
        deviceKey: device?.deviceKey ?? null,
        batteryLevel: profile?.batteryLevel ?? null,
        lastActiveAt: profile?.lastActiveAt?.toISOString() ?? null,
      });
    } catch (err) {
      request.log.error({ err }, 'Device status error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to get device status',
      });
    }
  });

  app.patch('/device/status/:elderlyProfileId', async (request, reply) => {
    try {
      const { elderlyProfileId } = request.params as { elderlyProfileId: string };
      const body = heartbeatSchema.parse(request.body ?? {});
      const deviceKeyHeader = request.headers['x-device-key'];
      const deviceKey = Array.isArray(deviceKeyHeader) ? deviceKeyHeader[0] : deviceKeyHeader;

      const [device] = await db.select()
        .from(deviceRegistrations)
        .where(eq(deviceRegistrations.elderlyProfileId, elderlyProfileId))
        .limit(1);

      if (deviceKey) {
        if (!device || device.deviceKey !== deviceKey) {
          return reply.status(403).send({
            statusCode: 403,
            error: 'Forbidden',
            message: 'Invalid device key',
          });
        }
      } else {
        await auth(request, reply);
        if (reply.sent) return;
        const access = await requireCaregiverAccess(request, reply, elderlyProfileId);
        if (!access) return;
      }

      await db.update(deviceRegistrations)
        .set({
          lastPingAt: new Date(),
          isActive: true,
        })
        .where(eq(deviceRegistrations.elderlyProfileId, elderlyProfileId));

      await db.update(elderlyProfiles)
        .set({
          batteryLevel: body.batteryLevel,
          lastActiveAt: new Date(),
          lastLocationLat: body.lastLocationLat != null ? body.lastLocationLat.toFixed(7) : undefined,
          lastLocationLng: body.lastLocationLng != null ? body.lastLocationLng.toFixed(7) : undefined,
          lastLocationAt: body.lastLocationLat != null && body.lastLocationLng != null ? new Date() : undefined,
        })
        .where(eq(elderlyProfiles.id, elderlyProfileId));

      return reply.send({
        updated: true,
        lastPingAt: new Date().toISOString(),
      });
    } catch (err) {
      request.log.error({ err }, 'Device heartbeat error');
      if (err instanceof z.ZodError) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Validation Error',
          message: err.issues[0]?.message,
        });
      }

      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to update device heartbeat',
      });
    }
  });

  app.post('/device/request-location', { preHandler: auth }, async (request, reply) => {
    try {
      const { elderlyProfileId } = z.object({
        elderlyProfileId: z.string().uuid(),
      }).parse(request.body);

      const access = await requireCaregiverAccess(request, reply, elderlyProfileId);
      if (!access) return;

      getIO()?.to(`device:${elderlyProfileId}`).emit('request_location', { elderlyProfileId });
      return reply.send({ sent: true });
    } catch (err) {
      request.log.error({ err }, 'Request location error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to request location',
      });
    }
  });
}
