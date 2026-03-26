import type { FastifyInstance } from 'fastify';
import { and, count, db, desc, eq, gte, medicationLogs, elderlyProfiles, sosEvents, sql, voiceCommandLogs } from '@sahayak/db';
import { getFirstLinkedProfileId, requireCaregiverAccess, requireDbUser } from '../../lib/auth';

export async function dashboardOverviewRoutes(app: FastifyInstance) {
  app.get('/overview', { preHandler: (app as any).authenticate }, async (request, reply) => {
    try {
      const dbUser = await requireDbUser(request, reply);
      if (!dbUser) return;

      const queryProfileId = (request.query as Record<string, string>)?.elderlyProfileId;
      const cookieHeader = request.headers.cookie || '';
      const selectedMatch = cookieHeader.match(/sahayak_selected_profile=([^;]+)/);
      const selectedProfileId = selectedMatch?.[1];
      const elderlyProfileId = queryProfileId || selectedProfileId || await getFirstLinkedProfileId(dbUser.id) || undefined;

      if (!elderlyProfileId) {
        return reply.send({
          profile: null,
          stats: { lastActive: null, medicationsToday: { taken: 0, total: 0, pending: 0, missed: 0 }, sosEventsThisWeek: 0, dailyUsage: 0 },
          recentActivity: [],
          location: { lat: null, lng: null, address: null, updatedAt: null },
        });
      }

      const access = await requireCaregiverAccess(request, reply, elderlyProfileId);
      if (!access) return;

      const [profile] = await db.select().from(elderlyProfiles)
        .where(eq(elderlyProfiles.id, access.link.elderlyProfileId))
        .limit(1);

      if (!profile) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Elderly profile not found',
        });
      }

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const medLogs = await db.select({
        status: medicationLogs.status,
        cnt: count(),
      })
        .from(medicationLogs)
        .where(and(
          eq(medicationLogs.elderlyProfileId, access.link.elderlyProfileId),
          gte(medicationLogs.scheduledAt, todayStart),
        ))
        .groupBy(medicationLogs.status);

      const medStats = { taken: 0, total: 0, pending: 0, missed: 0 };
      for (const row of medLogs) {
        const c = Number(row.cnt);
        medStats.total += c;
        if (row.status === 'taken') medStats.taken = c;
        if (row.status === 'pending') medStats.pending = c;
        if (row.status === 'missed') medStats.missed = c;
      }

      const [sosCount] = await db.select({ cnt: count() })
        .from(sosEvents)
        .where(and(
          eq(sosEvents.elderlyProfileId, access.link.elderlyProfileId),
          gte(sosEvents.triggeredAt, weekAgo),
        ));

      const [usageCount] = await db.select({ cnt: count() })
        .from(voiceCommandLogs)
        .where(and(
          eq(voiceCommandLogs.elderlyProfileId, access.link.elderlyProfileId),
          gte(voiceCommandLogs.timestamp, todayStart),
        ));

      const recentVoice = await db.select({
        id: voiceCommandLogs.id,
        type: sql<string>`'voice'`,
        text: voiceCommandLogs.commandText,
        intent: voiceCommandLogs.detectedIntent,
        language: voiceCommandLogs.language,
        timestamp: voiceCommandLogs.timestamp,
      })
        .from(voiceCommandLogs)
        .where(eq(voiceCommandLogs.elderlyProfileId, access.link.elderlyProfileId))
        .orderBy(desc(voiceCommandLogs.timestamp))
        .limit(10);

      const recentMeds = await db.select({
        id: medicationLogs.id,
        type: sql<string>`'medication'`,
        status: medicationLogs.status,
        reminderId: medicationLogs.reminderId,
        timestamp: medicationLogs.scheduledAt,
      })
        .from(medicationLogs)
        .where(eq(medicationLogs.elderlyProfileId, access.link.elderlyProfileId))
        .orderBy(desc(medicationLogs.scheduledAt))
        .limit(10);

      const recentSos = await db.select({
        id: sosEvents.id,
        type: sql<string>`'sos'`,
        triggerType: sosEvents.triggerType,
        severity: sosEvents.severity,
        locationLat: sosEvents.locationLat,
        locationLng: sosEvents.locationLng,
        timestamp: sosEvents.triggeredAt,
      })
        .from(sosEvents)
        .where(eq(sosEvents.elderlyProfileId, access.link.elderlyProfileId))
        .orderBy(desc(sosEvents.triggeredAt))
        .limit(10);

      const recentActivity = [
        ...recentVoice.map((voice) => ({ ...voice, type: 'voice' as const })),
        ...recentMeds.map((med) => ({ ...med, type: med.status === 'taken' ? 'med_taken' as const : 'med_missed' as const })),
        ...recentSos.map((sos) => ({ ...sos, type: 'sos' as const })),
      ].sort((a, b) => {
        const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return tb - ta;
      }).slice(0, 20);

      return reply.send({
        profile: {
          id: profile.id,
          name: profile.name,
          ageYears: profile.ageYears,
          primaryLanguage: profile.primaryLanguage,
          phoneNumber: profile.phoneNumber,
          isActive: profile.isActive,
          lastActiveAt: profile.lastActiveAt?.toISOString() || null,
          batteryLevel: profile.batteryLevel,
          state: profile.state,
        },
        stats: {
          lastActive: profile.lastActiveAt?.toISOString() || null,
          medicationsToday: medStats,
          sosEventsThisWeek: Number(sosCount?.cnt || 0),
          dailyUsage: Number(usageCount?.cnt || 0),
        },
        recentActivity,
        location: {
          lat: profile.lastLocationLat ? parseFloat(profile.lastLocationLat) : null,
          lng: profile.lastLocationLng ? parseFloat(profile.lastLocationLng) : null,
          address: null,
          updatedAt: profile.lastLocationAt?.toISOString() || null,
        },
      });
    } catch (error: unknown) {
      request.log.error({ error }, 'Dashboard overview error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to load dashboard data.',
      });
    }
  });
}
