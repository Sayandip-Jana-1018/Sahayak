import type { FastifyInstance } from 'fastify';
import { db, users, elderlyProfiles, caregiverLinks, medicationReminders, medicationLogs, sosEvents, voiceCommandLogs, eq, and, gte, desc, count, sql } from '@sahayak/db';

export async function dashboardOverviewRoutes(app: FastifyInstance) {
  app.get('/overview', async (request, reply) => {
    try {
      const clerkId = (request as any).user?.sub || (request as any).user?.userId;

      // Find user's caregiver link → elderly profile
      let userId: string | undefined;
      let elderlyProfileId: string | undefined;

      if (clerkId) {
        const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
        if (dbUser) {
          userId = dbUser.id;
          const [link] = await db.select().from(caregiverLinks)
            .where(eq(caregiverLinks.caregiverId, dbUser.id))
            .limit(1);
          if (link) {
            elderlyProfileId = link.elderlyProfileId;
          }
        }
      }

      // Also accept query param for testing
      if (!elderlyProfileId) {
        const queryProfileId = (request.query as Record<string, string>)?.elderlyProfileId;
        if (queryProfileId) elderlyProfileId = queryProfileId;
      }

      if (!elderlyProfileId) {
        return reply.send({
          profile: null,
          stats: { lastActive: null, medicationsToday: { taken: 0, total: 0, pending: 0, missed: 0 }, sosEventsThisWeek: 0, dailyUsage: 0 },
          recentActivity: [],
          location: { lat: null, lng: null, address: null, updatedAt: null },
        });
      }

      // Get elderly profile
      const [profile] = await db.select().from(elderlyProfiles)
        .where(eq(elderlyProfiles.id, elderlyProfileId))
        .limit(1);

      if (!profile) {
        return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: 'Elderly profile not found' });
      }

      // Today's start
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Medication stats today
      const medLogs = await db.select({
        status: medicationLogs.status,
        cnt: count(),
      })
        .from(medicationLogs)
        .where(and(
          eq(medicationLogs.elderlyProfileId, elderlyProfileId),
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

      // SOS events this week
      const [sosCount] = await db.select({ cnt: count() })
        .from(sosEvents)
        .where(and(
          eq(sosEvents.elderlyProfileId, elderlyProfileId),
          gte(sosEvents.triggeredAt, weekAgo),
        ));

      // Voice commands today
      const [usageCount] = await db.select({ cnt: count() })
        .from(voiceCommandLogs)
        .where(and(
          eq(voiceCommandLogs.elderlyProfileId, elderlyProfileId),
          gte(voiceCommandLogs.timestamp, todayStart),
        ));

      // Recent activity (last 20)
      const recentVoice = await db.select({
        id: voiceCommandLogs.id,
        type: sql<string>`'voice'`,
        text: voiceCommandLogs.commandText,
        intent: voiceCommandLogs.detectedIntent,
        language: voiceCommandLogs.language,
        timestamp: voiceCommandLogs.timestamp,
      })
        .from(voiceCommandLogs)
        .where(eq(voiceCommandLogs.elderlyProfileId, elderlyProfileId))
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
        .where(eq(medicationLogs.elderlyProfileId, elderlyProfileId))
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
        .where(eq(sosEvents.elderlyProfileId, elderlyProfileId))
        .orderBy(desc(sosEvents.triggeredAt))
        .limit(10);

      // Merge and sort
      const recentActivity = [
        ...recentVoice.map((v) => ({ ...v, type: 'voice' as const })),
        ...recentMeds.map((m) => ({ ...m, type: m.status === 'taken' ? 'med_taken' as const : 'med_missed' as const })),
        ...recentSos.map((s) => ({ ...s, type: 'sos' as const })),
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
          address: null, // Reverse geocoding would go here
          updatedAt: profile.lastLocationAt?.toISOString() || null,
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
