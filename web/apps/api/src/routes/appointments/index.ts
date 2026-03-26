import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { appointments, asc, db, eq } from '@sahayak/db';
import { getFirstLinkedProfileId, requireCaregiverAccess, requireDbUser } from '../../lib/auth';

export async function appointmentsRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  app.get('/appointments', { preHandler: auth }, async (request, reply) => {
    try {
      const dbUser = await requireDbUser(request, reply);
      if (!dbUser) return;

      const query = request.query as { elderlyProfileId?: string };
      const elderlyProfileId = query.elderlyProfileId ?? await getFirstLinkedProfileId(dbUser.id);
      const access = await requireCaregiverAccess(request, reply, elderlyProfileId);
      if (!access) return;

      const appts = await db.select()
        .from(appointments)
        .where(eq(appointments.elderlyProfileId, access.link.elderlyProfileId))
        .orderBy(asc(appointments.scheduledAt))
        .limit(100);

      return reply.send({
        appointments: appts.map((appt) => ({
          ...appt,
          scheduledAt: appt.scheduledAt?.toISOString() ?? null,
          createdAt: appt.createdAt?.toISOString() ?? null,
        })),
      });
    } catch (err) {
      request.log.error({ err }, 'Appointments GET error');
      return reply.status(500).send({ statusCode: 500, error: 'Internal Server Error', message: 'Failed to fetch appointments' });
    }
  });

  app.post('/appointments', { preHandler: auth }, async (request, reply) => {
    try {
      const dbUser = await requireDbUser(request, reply);
      if (!dbUser) return;

      const body = z.object({
        elderlyProfileId: z.string().uuid(),
        doctorName: z.string().min(1).max(200),
        specialty: z.string().max(200).optional(),
        location: z.string().max(500).optional(),
        scheduledAt: z.string().datetime(),
        notes: z.string().max(1000).optional(),
      }).parse(request.body);

      const access = await requireCaregiverAccess(request, reply, body.elderlyProfileId);
      if (!access) return;

      const [appt] = await db.insert(appointments).values({
        elderlyProfileId: body.elderlyProfileId,
        createdByUserId: dbUser.id,
        doctorName: body.doctorName,
        specialty: body.specialty,
        location: body.location,
        scheduledAt: new Date(body.scheduledAt),
        notes: body.notes,
      }).returning();

      return reply.status(201).send({
        ...appt,
        scheduledAt: appt.scheduledAt?.toISOString() ?? null,
        createdAt: appt.createdAt?.toISOString() ?? null,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({ statusCode: 400, error: 'Validation Error', message: err.issues[0]?.message });
      }
      request.log.error({ err }, 'Appointment POST error');
      return reply.status(500).send({ statusCode: 500, error: 'Internal Server Error', message: 'Failed to create appointment' });
    }
  });
}
