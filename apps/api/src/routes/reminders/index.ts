import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const createReminderSchema = z.object({
  elderlyProfileId: z.string().uuid(),
  type: z.enum(['medication', 'appointment', 'activity', 'hydration', 'custom']),
  title: z.string().min(1),
  description: z.string().optional(),
  time: z.string(),
  recurring: z.boolean().default(false),
  recurringPattern: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function remindersRoutes(app: FastifyInstance) {
  // GET reminders
  app.get('/reminders', async (request, reply) => {
    try {
      const { elderlyProfileId } = request.query as { elderlyProfileId?: string };

      if (!elderlyProfileId) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'elderlyProfileId query parameter is required',
        });
      }

      return reply.send({
        reminders: [],
        total: 0,
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Reminders list error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to fetch reminders.',
      });
    }
  });

  // POST create reminder
  app.post('/reminders', async (request, reply) => {
    const parsed = createReminderSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: parsed.error.issues.map(i => i.message).join(', '),
        details: parsed.error.issues,
      });
    }

    try {
      return reply.status(201).send({
        id: crypto.randomUUID(),
        ...parsed.data,
        createdAt: new Date().toISOString(),
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Reminder create error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to create reminder.',
      });
    }
  });

  // DELETE reminder
  app.delete('/reminders/:id', async (request, reply) => {
    try {
      return reply.status(204).send();
    } catch (error: unknown) {
      app.log.error({ error }, 'Reminder delete error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to delete reminder.',
      });
    }
  });
}
