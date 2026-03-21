import type { FastifyInstance } from 'fastify';

export async function dashboardOverviewRoutes(app: FastifyInstance) {
  app.get('/overview', async (request, reply) => {
    try {
      return reply.send({
        profile: {
          id: '',
          name: '',
          ageYears: 0,
          primaryLanguage: 'hi',
          phoneNumber: '',
          isActive: true,
          lastActiveAt: new Date().toISOString(),
          batteryLevel: 85,
        },
        stats: {
          lastActive: new Date().toISOString(),
          medicationsToday: { taken: 0, total: 0, pending: 0 },
          sosEventsThisWeek: 0,
          dailyUsageMinutes: 0,
          usageTrend: 0,
        },
        recentActivity: [],
        location: {
          lat: null,
          lng: null,
          address: null,
          updatedAt: null,
        },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch dashboard';
      app.log.error({ error }, 'Dashboard overview error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to load dashboard data.',
      });
    }
  });
}
