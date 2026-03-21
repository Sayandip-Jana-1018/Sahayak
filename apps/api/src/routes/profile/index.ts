import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const updateProfileSchema = z.object({
  fullName: z.string().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

export async function profileRoutes(app: FastifyInstance) {
  // GET profile
  app.get('/profile', async (request, reply) => {
    try {
      return reply.send({
        id: '',
        email: '',
        phone: '',
        fullName: '',
        avatarUrl: '',
        role: 'family',
        createdAt: new Date().toISOString(),
        elderlyProfiles: [],
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Profile fetch error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to fetch profile.',
      });
    }
  });

  // PUT update profile
  app.put('/profile', async (request, reply) => {
    const parsed = updateProfileSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: parsed.error.issues.map(i => i.message).join(', '),
      });
    }

    try {
      return reply.send({
        ...parsed.data,
        updatedAt: new Date().toISOString(),
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Profile update error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to update profile.',
      });
    }
  });
}
