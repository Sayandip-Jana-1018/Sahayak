import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const sosTriggerSchema = z.object({
  userId: z.string().uuid(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  triggerType: z.enum(['voice', 'shake', 'inactivity', 'fall']),
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
        message: parsed.error.issues.map(i => i.message).join(', '),
      });
    }

    const { userId, location, triggerType, severity } = parsed.data;

    try {
      const googleMapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
      const responseTimeMs = Date.now() - startTime;

      return reply.send({
        acknowledged: true,
        sosEventId: crypto.randomUUID(),
        notified_count: 0,
        nearest_hospital: {
          name: null,
          phone: null,
          distance_km: null,
        },
        location_url: googleMapsUrl,
        trigger_type: triggerType,
        severity,
        response_time_ms: responseTimeMs,
        timestamp: new Date().toISOString(),
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
