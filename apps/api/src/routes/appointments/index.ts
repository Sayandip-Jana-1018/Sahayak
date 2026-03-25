import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db, users, appointments, caregiverLinks, eq } from '@sahayak/db';
import { asc } from 'drizzle-orm';

export async function appointmentsRoutes(app: FastifyInstance) {
  // GET /api/appointments
  app.get('/appointments', async (request, reply) => {
    try {
      const clerkId = (request as any).user?.sub ?? (request as any).user?.userId;
      let elderlyProfileId: string | undefined;

      if (clerkId) {
        const [dbUser] = await db.select({ id: users.id }).from(users).where(eq(users.clerkId, clerkId)).limit(1);
        if (dbUser) {
          const [link] = await db.select({ elderlyProfileId: caregiverLinks.elderlyProfileId })
            .from(caregiverLinks).where(eq(caregiverLinks.caregiverId, dbUser.id)).limit(1);
          elderlyProfileId = link?.elderlyProfileId;
        }
      }

      const query = request.query as { elderlyProfileId?: string };
      if (query.elderlyProfileId) elderlyProfileId = query.elderlyProfileId;

      if (!elderlyProfileId) return reply.send({ appointments: [] });

      const appts = await db.select()
        .from(appointments)
        .where(eq(appointments.elderlyProfileId, elderlyProfileId))
        .orderBy(asc(appointments.scheduledAt))
        .limit(100);

      return reply.send({
        appointments: appts.map((a) => ({
          ...a,
          scheduledAt: a.scheduledAt?.toISOString() ?? null,
          createdAt: a.createdAt?.toISOString() ?? null,
        })),
      });
    } catch (err) {
      app.log.error({ err }, 'Appointments GET error');
      return reply.status(500).send({ statusCode: 500, error: 'Internal Server Error', message: 'Failed to fetch appointments' });
    }
  });

  // POST /api/appointments
  app.post('/appointments', async (request, reply) => {
    try {
      const clerkId = (request as any).user?.sub ?? (request as any).user?.userId;
      if (!clerkId) return reply.status(401).send({ statusCode: 401, error: 'Unauthorized' });

      const [dbUser] = await db.select({ id: users.id }).from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser) return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'User not found' });

      const body = z.object({
        elderlyProfileId: z.string().uuid(),
        doctorName: z.string().min(1).max(200),
        specialty: z.string().max(200).optional(),
        location: z.string().max(500).optional(),
        scheduledAt: z.string().datetime(),
        notes: z.string().max(1000).optional(),
      }).parse(request.body);

      // Verify caregiver access
      const [link] = await db.select({ id: caregiverLinks.id })
        .from(caregiverLinks)
        .where(eq(caregiverLinks.caregiverId, dbUser.id))
        .limit(1);
      if (!link) return reply.status(403).send({ statusCode: 403, error: 'Forbidden', message: 'Access denied' });

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
      if (err instanceof z.ZodError) return reply.status(400).send({ statusCode: 400, error: 'Validation Error', message: err.issues[0]?.message });
      app.log.error({ err }, 'Appointment POST error');
      return reply.status(500).send({ statusCode: 500, error: 'Internal Server Error', message: 'Failed to create appointment' });
    }
  });
}
