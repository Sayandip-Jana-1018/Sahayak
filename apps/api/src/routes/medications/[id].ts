import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const updateMedicationSchema = z.object({
  medicineName: z.string().min(1).optional(),
  genericName: z.string().optional(),
  dosage: z.string().optional(),
  unit: z.string().optional(),
  frequency: z.string().optional(),
  reminderTimes: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
  instructions: z.string().optional(),
});

export async function medicationByIdRoutes(app: FastifyInstance) {
  // PUT update medication
  app.put('/medications/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const parsed = updateMedicationSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: parsed.error.issues.map(i => i.message).join(', '),
      });
    }

    try {
      // DB update would go here
      return reply.send({
        id,
        ...parsed.data,
        updatedAt: new Date().toISOString(),
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Medication update error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to update medication.',
      });
    }
  });

  // DELETE medication
  app.delete('/medications/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      // DB delete would go here
      return reply.status(204).send();
    } catch (error: unknown) {
      app.log.error({ error }, 'Medication delete error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to delete medication.',
      });
    }
  });
}
