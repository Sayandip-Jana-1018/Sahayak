import type { FastifyInstance } from 'fastify';
import { db, eq, medicationReminders } from '@sahayak/db';
import { z } from 'zod';
import { requireCaregiverAccess } from '../../lib/auth';

const updateMedicationSchema = z.object({
  elderlyProfileId: z.string().uuid(),
  medicineName: z.string().min(1).optional(),
  genericName: z.string().optional(),
  dosage: z.string().optional(),
  unit: z.string().optional(),
  frequency: z.string().optional(),
  reminderTimes: z.array(z.string().regex(/^\d{2}:\d{2}$/)).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
  instructions: z.string().optional(),
});

export async function medicationByIdRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  app.put('/medications/:id', { preHandler: auth }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = updateMedicationSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: parsed.error.issues.map((issue) => issue.message).join(', '),
      });
    }

    try {
      const access = await requireCaregiverAccess(request, reply, parsed.data.elderlyProfileId);
      if (!access) return;

      const [existing] = await db.select().from(medicationReminders)
        .where(eq(medicationReminders.id, id))
        .limit(1);

      if (!existing || existing.elderlyProfileId !== parsed.data.elderlyProfileId) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Medication reminder not found',
        });
      }

      const [updated] = await db.update(medicationReminders)
        .set({
          medicineName: parsed.data.medicineName,
          genericName: parsed.data.genericName,
          dosage: parsed.data.dosage,
          unit: parsed.data.unit,
          frequency: parsed.data.frequency,
          reminderTimes: parsed.data.reminderTimes,
          startDate: parsed.data.startDate ?? undefined,
          endDate: parsed.data.endDate ?? undefined,
          isActive: parsed.data.isActive,
          instructions: parsed.data.instructions,
        })
        .where(eq(medicationReminders.id, id))
        .returning();

      return reply.send({
        ...updated,
        createdAt: updated.createdAt?.toISOString?.() ?? updated.createdAt ?? null,
      });
    } catch (error: unknown) {
      request.log.error({ error }, 'Medication update error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to update medication.',
      });
    }
  });

  app.delete('/medications/:id', { preHandler: auth }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = z.object({ elderlyProfileId: z.string().uuid() }).safeParse(request.body ?? {});

    if (!body.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: 'elderlyProfileId is required',
      });
    }

    try {
      const access = await requireCaregiverAccess(request, reply, body.data.elderlyProfileId);
      if (!access) return;

      const [existing] = await db.select().from(medicationReminders)
        .where(eq(medicationReminders.id, id))
        .limit(1);

      if (!existing || existing.elderlyProfileId !== body.data.elderlyProfileId) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Medication reminder not found',
        });
      }

      await db.delete(medicationReminders).where(eq(medicationReminders.id, id));
      return reply.status(204).send();
    } catch (error: unknown) {
      request.log.error({ error }, 'Medication delete error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to delete medication.',
      });
    }
  });
}
