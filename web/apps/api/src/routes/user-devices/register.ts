import type { FastifyInstance } from 'fastify';
import { db, eq, userDevices } from '@sahayak/db';
import { z } from 'zod';
import { requireDbUser } from '../../lib/auth';

const registerUserDeviceSchema = z.object({
  deviceInstallationId: z.string().min(8),
  platform: z.string().min(2),
  deviceModel: z.string().optional(),
  osVersion: z.string().optional(),
  appVersion: z.string().optional(),
  fcmToken: z.string().optional(),
});

export async function userDeviceRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  app.post('/user-devices/register', { preHandler: auth }, async (request, reply) => {
    try {
      const dbUser = await requireDbUser(request, reply);
      if (!dbUser) return;

      const body = registerUserDeviceSchema.parse(request.body);

      const [existing] = await db.select()
        .from(userDevices)
        .where(eq(userDevices.deviceInstallationId, body.deviceInstallationId))
        .limit(1);

      const payload = {
        userId: dbUser.id,
        platform: body.platform,
        deviceModel: body.deviceModel,
        osVersion: body.osVersion,
        appVersion: body.appVersion,
        fcmToken: body.fcmToken,
        lastSeenAt: new Date(),
        isActive: true,
      };

      const [device] = existing
        ? await db.update(userDevices)
            .set(payload)
            .where(eq(userDevices.id, existing.id))
            .returning()
        : await db.insert(userDevices)
            .values({
              deviceInstallationId: body.deviceInstallationId,
              ...payload,
            })
            .returning();

      return reply.send({
        registered: true,
        id: device.id,
        userId: device.userId,
        deviceInstallationId: device.deviceInstallationId,
      });
    } catch (error) {
      request.log.error({ error }, 'User device register error');
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Validation Error',
          message: error.issues.map((issue) => issue.message).join(', '),
        });
      }

      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to register user device',
      });
    }
  });
}
