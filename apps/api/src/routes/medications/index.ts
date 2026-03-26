import type { FastifyInstance } from 'fastify';
import { and, db, eq, gte, lt, medicationLogs, medicationReminders } from '@sahayak/db';
import { z } from 'zod';
import { getFirstLinkedProfileId, requireCaregiverAccess, requireDbUser } from '../../lib/auth';

const createMedicationSchema = z.object({
  elderlyProfileId: z.string().uuid(),
  medicineName: z.string().min(1, 'Medicine name is required'),
  genericName: z.string().optional(),
  dosage: z.string().optional(),
  unit: z.string().optional(),
  frequency: z.string().optional(),
  reminderTimes: z.array(z.string().regex(/^\d{2}:\d{2}$/)).min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  instructions: z.string().optional(),
});

const adherenceQuerySchema = z.object({
  elderlyProfileId: z.string().uuid().optional(),
  days: z.coerce.number().int().min(1).max(30).default(7),
});

const takenSchema = z.object({
  elderlyProfileId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  takenBy: z.string().optional(),
  notes: z.string().optional(),
});

function startOfDay(date = new Date()) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfDay(date = new Date()) {
  const value = startOfDay(date);
  value.setDate(value.getDate() + 1);
  return value;
}

function parseDateValue(value?: string | null) {
  return value ? new Date(`${value}T00:00:00`) : null;
}

function isReminderActiveOnDate(reminder: {
  startDate: string | null;
  endDate: string | null;
  isActive: boolean | null;
}, date: Date) {
  if (reminder.isActive === false) return false;

  const day = startOfDay(date);
  const startDateValue = parseDateValue(reminder.startDate);
  const endDateValue = parseDateValue(reminder.endDate);

  if (startDateValue && day < startDateValue) return false;
  if (endDateValue && day > endDateValue) return false;
  return true;
}

function buildScheduledAt(date: Date, hhmm: string) {
  const [hours, minutes] = hhmm.split(':').map(Number);
  const scheduledAt = new Date(date);
  scheduledAt.setHours(hours, minutes, 0, 0);
  return scheduledAt;
}

function normalizeMedication(reminder: any, logs: any[], date: Date) {
  const schedule = (reminder.reminderTimes ?? [])
    .map((time: string) => {
      const scheduledAt = buildScheduledAt(date, time);
      const matchingLog = logs.find((log) =>
        log.reminderId === reminder.id &&
        new Date(log.scheduledAt).getTime() === scheduledAt.getTime(),
      );

      const status = matchingLog?.status
        ?? (scheduledAt.getTime() < Date.now() ? 'missed' : 'pending');

      return {
        reminderId: reminder.id,
        time,
        scheduledAt: scheduledAt.toISOString(),
        status,
        takenAt: matchingLog?.takenAt ? new Date(matchingLog.takenAt).toISOString() : null,
        logId: matchingLog?.id ?? null,
      };
    })
    .sort((a: any, b: any) => a.time.localeCompare(b.time));

  return {
    ...reminder,
    startDate: reminder.startDate ?? null,
    endDate: reminder.endDate ?? null,
    createdAt: reminder.createdAt?.toISOString?.() ?? reminder.createdAt ?? null,
    todaySchedule: schedule,
    todayStatus: schedule.every((item: any) => item.status === 'taken')
      ? 'taken'
      : schedule.some((item: any) => item.status === 'pending')
        ? 'pending'
        : schedule.some((item: any) => item.status === 'missed')
          ? 'missed'
          : 'pending',
  };
}

export async function medicationsRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;

  app.get('/medications', { preHandler: auth }, async (request, reply) => {
    try {
      const dbUser = await requireDbUser(request, reply);
      if (!dbUser) return;

      const query = request.query as { elderlyProfileId?: string };
      const elderlyProfileId = query.elderlyProfileId ?? await getFirstLinkedProfileId(dbUser.id);
      const access = await requireCaregiverAccess(request, reply, elderlyProfileId);
      if (!access) return;

      const today = startOfDay();
      const tomorrow = endOfDay(today);

      const [reminders, logs] = await Promise.all([
        db.select().from(medicationReminders)
          .where(eq(medicationReminders.elderlyProfileId, access.link.elderlyProfileId)),
        db.select().from(medicationLogs)
          .where(and(
            eq(medicationLogs.elderlyProfileId, access.link.elderlyProfileId),
            gte(medicationLogs.scheduledAt, today),
            lt(medicationLogs.scheduledAt, tomorrow),
          )),
      ]);

      const activeReminders = reminders.filter((reminder) => isReminderActiveOnDate(reminder, today));
      const medications = activeReminders
        .map((reminder) => normalizeMedication(reminder, logs, today))
        .sort((a, b) => {
          const firstA = a.todaySchedule[0]?.time ?? '23:59';
          const firstB = b.todaySchedule[0]?.time ?? '23:59';
          return firstA.localeCompare(firstB);
        });

      return reply.send({
        medications,
        total: medications.length,
      });
    } catch (error: unknown) {
      request.log.error({ error }, 'Medications list error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to fetch medications.',
      });
    }
  });

  app.get('/medications/adherence', { preHandler: auth }, async (request, reply) => {
    try {
      const dbUser = await requireDbUser(request, reply);
      if (!dbUser) return;

      const query = adherenceQuerySchema.parse(request.query);
      const elderlyProfileId = query.elderlyProfileId ?? await getFirstLinkedProfileId(dbUser.id);
      const access = await requireCaregiverAccess(request, reply, elderlyProfileId);
      if (!access) return;

      const rangeEnd = endOfDay();
      const rangeStart = startOfDay(new Date(Date.now() - (query.days - 1) * 24 * 60 * 60 * 1000));

      const [reminders, logs] = await Promise.all([
        db.select().from(medicationReminders)
          .where(eq(medicationReminders.elderlyProfileId, access.link.elderlyProfileId)),
        db.select().from(medicationLogs)
          .where(and(
            eq(medicationLogs.elderlyProfileId, access.link.elderlyProfileId),
            gte(medicationLogs.scheduledAt, rangeStart),
            lt(medicationLogs.scheduledAt, rangeEnd),
          )),
      ]);

      const adherence = Array.from({ length: query.days }).map((_, index) => {
        const date = startOfDay(new Date(rangeStart.getTime() + index * 24 * 60 * 60 * 1000));
        const dayEnd = endOfDay(date);
        const activeReminders = reminders.filter((reminder) => isReminderActiveOnDate(reminder, date));
        const total = activeReminders.reduce((sum, reminder) => sum + (reminder.reminderTimes?.length ?? 0), 0);
        const taken = logs.filter((log) =>
          log.status === 'taken' &&
          new Date(log.scheduledAt) >= date &&
          new Date(log.scheduledAt) < dayEnd
        ).length;
        const percent = total > 0 ? Math.round((taken / total) * 100) : 0;

        return {
          date: date.toISOString().slice(0, 10),
          taken,
          total,
          percent,
        };
      });

      let streakDays = 0;
      for (let index = adherence.length - 1; index >= 0; index -= 1) {
        const day = adherence[index];
        if (day.total > 0 && day.percent === 100) {
          streakDays += 1;
        } else {
          break;
        }
      }

      const totals = adherence.reduce((acc, day) => ({
        taken: acc.taken + day.taken,
        total: acc.total + day.total,
      }), { taken: 0, total: 0 });

      return reply.send({
        adherence,
        overall_percent: totals.total > 0 ? Math.round((totals.taken / totals.total) * 100) : 0,
        streak_days: streakDays,
      });
    } catch (error: unknown) {
      request.log.error({ error }, 'Medication adherence error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to fetch medication adherence.',
      });
    }
  });

  app.post('/medications', { preHandler: auth }, async (request, reply) => {
    const parsed = createMedicationSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: parsed.error.issues.map((issue) => issue.message).join(', '),
        details: parsed.error.issues,
      });
    }

    try {
      const access = await requireCaregiverAccess(request, reply, parsed.data.elderlyProfileId);
      if (!access) return;

      const [created] = await db.insert(medicationReminders).values({
        elderlyProfileId: parsed.data.elderlyProfileId,
        medicineName: parsed.data.medicineName,
        genericName: parsed.data.genericName,
        dosage: parsed.data.dosage,
        unit: parsed.data.unit,
        frequency: parsed.data.frequency,
        reminderTimes: parsed.data.reminderTimes,
        startDate: parsed.data.startDate ?? null,
        endDate: parsed.data.endDate ?? null,
        instructions: parsed.data.instructions,
        isActive: true,
      }).returning();

      return reply.status(201).send({
        ...created,
        createdAt: created.createdAt?.toISOString?.() ?? created.createdAt ?? null,
      });
    } catch (error: unknown) {
      request.log.error({ error }, 'Medication create error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to create medication.',
      });
    }
  });

  app.post('/medications/:id/taken', { preHandler: auth }, async (request, reply) => {
    const parsed = takenSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: parsed.error.issues.map((issue) => issue.message).join(', '),
      });
    }

    try {
      const { id } = request.params as { id: string };
      const access = await requireCaregiverAccess(request, reply, parsed.data.elderlyProfileId);
      if (!access) return;

      const [reminder] = await db.select().from(medicationReminders)
        .where(eq(medicationReminders.id, id))
        .limit(1);

      if (!reminder || reminder.elderlyProfileId !== parsed.data.elderlyProfileId) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Medication reminder not found',
        });
      }

      const scheduledAt = new Date(parsed.data.scheduledAt);
      const [existing] = await db.select().from(medicationLogs)
        .where(and(
          eq(medicationLogs.reminderId, id),
          eq(medicationLogs.elderlyProfileId, parsed.data.elderlyProfileId),
          eq(medicationLogs.scheduledAt, scheduledAt),
        ))
        .limit(1);

      const payload = {
        status: 'taken' as const,
        takenAt: new Date(),
        takenBy: parsed.data.takenBy ?? access.dbUser.fullName ?? access.dbUser.email ?? 'caregiver',
        notes: parsed.data.notes,
      };

      const [log] = existing
        ? await db.update(medicationLogs)
            .set(payload)
            .where(eq(medicationLogs.id, existing.id))
            .returning()
        : await db.insert(medicationLogs)
            .values({
              reminderId: id,
              elderlyProfileId: parsed.data.elderlyProfileId,
              scheduledAt,
              ...payload,
            })
            .returning();

      return reply.send({
        ...log,
        scheduledAt: log.scheduledAt?.toISOString() ?? null,
        takenAt: log.takenAt?.toISOString() ?? null,
      });
    } catch (error: unknown) {
      request.log.error({ error }, 'Medication mark-as-taken error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to mark medication as taken.',
      });
    }
  });
}
