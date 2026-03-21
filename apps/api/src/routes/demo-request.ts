import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const demoRequestSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  organization: z.string().min(2, 'Organization is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Invalid email').optional(),
  state: z.string().optional(),
  estimatedDevices: z.number().int().positive().optional(),
});

export async function demoRequestRoutes(app: FastifyInstance) {
  app.post('/demo-request', {
    config: {
      rateLimit: {
        max: 3,
        timeWindow: '1 hour',
      },
    },
  }, async (request, reply) => {
    const parsed = demoRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: parsed.error.issues.map(i => i.message).join(', '),
        details: parsed.error.issues,
      });
    }

    try {
      const demoRequest = parsed.data;

      return reply.status(201).send({
        id: crypto.randomUUID(),
        ...demoRequest,
        status: 'new',
        createdAt: new Date().toISOString(),
        message: 'Thank you! Our team will contact you within 24 hours to schedule a demo.',
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Demo request error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to submit demo request. Please try again.',
      });
    }
  });
}
