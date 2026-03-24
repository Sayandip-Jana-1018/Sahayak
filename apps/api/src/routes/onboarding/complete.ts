import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db, users, elderlyProfiles, caregiverLinks, eq } from '@sahayak/db';

const OnboardingCompleteSchema = z.object({
  userType: z.enum(['family', 'self', 'organization']),
  elderlyName: z.string().min(2),
  ageYears: z.number().min(50).max(100),
  state: z.string().min(1),
  district: z.string().optional().default(''),
  primaryLanguage: z.enum(['hi', 'ta', 'bn', 'mr', 'te', 'kn', 'gu', 'pa', 'ml', 'ur', 'en']),
  emergencyContactName: z.string().min(2),
  emergencyContactPhone: z.string().regex(/^[6-9]\d{9}$/),
  voiceProfileComplete: z.boolean().default(false),
  voiceSampleIds: z.array(z.string()).default([]),
  appInstalled: z.boolean().default(false),
});

export async function onboardingRoutes(app: FastifyInstance) {
  app.post('/onboarding/complete', async (request, reply) => {
    try {
      const parsed = OnboardingCompleteSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Validation Error',
          message: parsed.error.issues.map((i) => i.message).join(', '),
          details: parsed.error.issues,
        });
      }

      const data = parsed.data;

      // Get the user from JWT (clerkId is in the token sub)
      const clerkId = (request as any).user?.sub || (request as any).user?.userId;
      if (!clerkId) {
        return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'No user found' });
      }

      // Find user in DB
      const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser) {
        // Create user if webhook hasn't fired yet
        const [newUser] = await db.insert(users).values({ clerkId, fullName: data.elderlyName }).returning();
        if (!newUser) {
          return reply.status(500).send({ statusCode: 500, error: 'Internal Error', message: 'Failed to create user' });
        }
      }

      const userId = dbUser?.id;
      if (!userId) {
        return reply.status(500).send({ statusCode: 500, error: 'Internal Error', message: 'User not found after creation' });
      }

      // Check if elderly profile already exists (idempotent)
      const existing = await db.select().from(elderlyProfiles)
        .where(eq(elderlyProfiles.createdByUserId, userId))
        .limit(1);

      if (existing.length > 0) {
        return reply.send({ elderlyProfileId: existing[0].id, dashboardUrl: '/dashboard' });
      }

      // Create elderly profile
      const [profile] = await db.insert(elderlyProfiles).values({
        createdByUserId: userId,
        name: data.elderlyName,
        ageYears: data.ageYears,
        state: data.state,
        district: data.district,
        primaryLanguage: data.primaryLanguage,
      }).returning();

      if (!profile) {
        return reply.status(500).send({ statusCode: 500, error: 'Internal Error', message: 'Failed to create profile' });
      }

      // Create caregiver link
      await db.insert(caregiverLinks).values({
        caregiverId: userId,
        elderlyProfileId: profile.id,
        relationship: 'primary',
        priority: 1,
      });

      // Update user as onboarding complete
      await db.update(users)
        .set({ onboardingComplete: true, role: data.userType === 'organization' ? 'ngo_admin' : 'family' })
        .where(eq(users.id, userId));

      return reply.send({
        elderlyProfileId: profile.id,
        dashboardUrl: '/dashboard',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to complete onboarding';
      app.log.error({ error }, 'Onboarding complete error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message,
      });
    }
  });
}
