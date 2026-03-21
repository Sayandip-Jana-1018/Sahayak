import type { FastifyInstance } from 'fastify';

export async function dashboardHealthRoutes(app: FastifyInstance) {
  app.get('/health-data', async (request, reply) => {
    try {
      return reply.send({
        activityChart: {
          labels: [],
          data: [],
        },
        medicationAdherence: {
          labels: [],
          taken: [],
          missed: [],
        },
        healthNotes: [],
        appointments: [],
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Dashboard health error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to load health data.',
      });
    }
  });
}
