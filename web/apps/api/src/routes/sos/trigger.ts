import type { FastifyInstance } from 'fastify';
import { caregiverLinks, db, elderlyProfiles, eq, inArray, sosEvents, userDevices, users } from '@sahayak/db';
import { emitToCaregiver, emitToUser } from '../../plugins/socket';
import { buildSosSmsMessage, sendBulkSms } from '../../lib/sms';
import { z } from 'zod';

const sosTriggerSchema = z.object({
  userId: z.string().uuid(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional(),
  triggerType: z.enum(['button', 'voice', 'shake', 'inactivity', 'fall']),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('high'),
});

export async function sosTriggerRoutes(app: FastifyInstance) {
  app.post('/trigger', async (request, reply) => {
    const startTime = Date.now();

    const parsed = sosTriggerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: parsed.error.issues.map((issue) => issue.message).join(', '),
      });
    }

    const { userId, location, triggerType, severity } = parsed.data;

    try {
      const [profile] = await db
        .select({
          id: elderlyProfiles.id,
          name: elderlyProfiles.name,
        })
        .from(elderlyProfiles)
        .where(eq(elderlyProfiles.id, userId))
        .limit(1);

      if (!profile) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Elderly profile not found',
        });
      }

      const [created] = await db.insert(sosEvents).values({
        elderlyProfileId: userId,
        triggerType,
        severity,
        locationLat: location?.lat != null ? location.lat.toFixed(7) : null,
        locationLng: location?.lng != null ? location.lng.toFixed(7) : null,
        triggeredAt: new Date(),
        smsCount: 0,
        pushCount: 0,
      }).returning();

      const links = await db
        .select({
          caregiverId: caregiverLinks.caregiverId,
          priority: caregiverLinks.priority,
          sosEnabled: caregiverLinks.sosEnabled,
        })
        .from(caregiverLinks)
        .where(eq(caregiverLinks.elderlyProfileId, userId));

      const caregiverIds = links
        .filter((link) => link.sosEnabled !== false)
        .map((link) => link.caregiverId);

      const caregiverUsers = caregiverIds.length > 0
        ? await db
            .select({
              id: users.id,
              phone: users.phone,
              fullName: users.fullName,
            })
            .from(users)
            .where(inArray(users.id, caregiverIds))
        : [];

      const googleMapsUrl = location
        ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
        : null;

      for (const caregiverId of caregiverIds) {
        emitToCaregiver(userId, 'sos_triggered', {
          sosEventId: created.id,
          elderlyProfileId: userId,
          elderName: profile.name,
          triggerType,
          severity,
          location,
          locationUrl: googleMapsUrl,
          triggeredAt: created.triggeredAt?.toISOString() ?? new Date().toISOString(),
        });

        emitToUser(caregiverId, 'sos_triggered', {
          sosEventId: created.id,
          elderlyProfileId: userId,
          elderName: profile.name,
          triggerType,
          severity,
          location,
          locationUrl: googleMapsUrl,
          triggeredAt: created.triggeredAt?.toISOString() ?? new Date().toISOString(),
        });
      }

      const smsMessage = buildSosSmsMessage({
        elderName: profile.name,
        triggerType,
        severity,
        lat: location?.lat,
        lng: location?.lng,
      });
      const smsCount = await sendBulkSms(
        caregiverUsers
          .map((user) => user.phone)
          .filter((phone): phone is string => Boolean(phone)),
        smsMessage,
      );

      const notifiedUserIds = caregiverUsers.map((user) => user.id);
      const pushTargets = caregiverIds.length > 0
        ? await db.select({ id: userDevices.id })
            .from(userDevices)
            .where(inArray(userDevices.userId, caregiverIds))
        : [];

      await db.update(sosEvents)
        .set({
          notifiedUserIds,
          smsCount,
          pushCount: pushTargets.length,
        })
        .where(eq(sosEvents.id, created.id));

      const responseTimeMs = Date.now() - startTime;

      return reply.send({
        acknowledged: true,
        sosEventId: created.id,
        notified_count: notifiedUserIds.length,
        nearest_hospital: {
          name: created.nearestHospitalName,
          phone: created.nearestHospitalPhone,
          distance_km: created.nearestHospitalDistance,
        },
        location_url: googleMapsUrl,
        trigger_type: triggerType,
        severity,
        response_time_ms: responseTimeMs,
        timestamp: created.triggeredAt?.toISOString() ?? new Date().toISOString(),
      });
    } catch (error: unknown) {
      app.log.error({ error, userId, triggerType }, 'CRITICAL: SOS trigger error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'SOS Processing Error',
        message: 'SOS acknowledged but processing encountered an error. Family may need to be contacted manually.',
        acknowledged: true,
      });
    }
  });
}
