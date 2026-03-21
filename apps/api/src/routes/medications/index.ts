import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const createMedicationSchema = z.object({
  elderlyProfileId: z.string().uuid(),
  medicineName: z.string().min(1, 'Medicine name is required'),
  genericName: z.string().optional(),
  dosage: z.string().optional(),
  unit: z.string().optional(),
  frequency: z.string().optional(),
  reminderTimes: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  instructions: z.string().optional(),
});

export async function medicationsRoutes(app: FastifyInstance) {
  // GET all medications for an elderly profile
  app.get('/medications', async (request, reply) => {
    try {
      const { elderlyProfileId } = request.query as { elderlyProfileId?: string };

      if (!elderlyProfileId) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'elderlyProfileId query parameter is required',
        });
      }

      // DB query would go here
      return reply.send({
        medications: [],
        total: 0,
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Medications list error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to fetch medications.',
      });
    }
  });

  // POST create new medication
  app.post('/medications', async (request, reply) => {
    const parsed = createMedicationSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: parsed.error.issues.map(i => i.message).join(', '),
        details: parsed.error.issues,
      });
    }

    try {
      const medication = parsed.data;

      // DB insert would go here
      return reply.status(201).send({
        id: crypto.randomUUID(),
        ...medication,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Medication create error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to create medication.',
      });
    }
  });
}
