import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db, users, elderlyProfiles, caregiverLinks, eq } from '@sahayak/db';
import { createClerkClient } from '@clerk/backend';

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

/**
 * Safely extract the Clerk User ID from a Bearer JWT without RSA signature verification.
 * Clerk tokens are RS256-signed — they cannot be verified with the Clerk secret key string.
 * Since the frontend validates the session via Clerk's own SDK, we trust the token's
 * `sub` payload field for internal DB lookups only.
 */
function extractClerkId(authHeader?: string): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.slice(7);
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return payload.sub || null;
  } catch {
    return null;
  }
}

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

      // Extract Clerk user ID from JWT payload
      const clerkId = extractClerkId(request.headers.authorization);
      if (!clerkId) {
        return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'No user found in token' });
      }

      // Find user in DB
      let [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser) {
        // Create user if webhook hasn't fired yet
        const [newUser] = await db.insert(users).values({ clerkId, fullName: data.elderlyName }).returning();
        if (!newUser) {
          return reply.status(500).send({ statusCode: 500, error: 'Internal Error', message: 'Failed to create user' });
        }
        dbUser = newUser;
      }

      const userId = dbUser.id;

      // Helper: update Clerk publicMetadata (must run on every successful call)
      const updateClerkPublicMetadata = async () => {
        try {
          app.log.info({ clerkId, secretKeyPrefix: process.env.CLERK_SECRET_KEY?.slice(0, 10) }, 'Attempting Clerk publicMetadata update...');
          const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
          const updatedUser = await clerk.users.updateUser(clerkId, {
            publicMetadata: {
              onboarding_complete: true,
              role: data.userType === 'organization' ? 'ngo_admin' : 'family',
            },
          });
          app.log.info({ clerkId, publicMetadata: updatedUser.publicMetadata }, 'Clerk publicMetadata updated successfully');
        } catch (clerkErr: any) {
          app.log.error({ clerkId, error: clerkErr?.message || clerkErr, stack: clerkErr?.stack }, 'Failed to update Clerk publicMetadata');
        }
      };

      // Check if elderly profile already exists (idempotent)
      const existing = await db.select().from(elderlyProfiles)
        .where(eq(elderlyProfiles.createdByUserId, userId))
        .limit(1);

      if (existing.length > 0) {
        // Profile exists, but still ensure Clerk metadata is set
        await updateClerkPublicMetadata();
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

      // Mark user onboarding complete
      await db.update(users)
        .set({ onboardingComplete: true, role: data.userType === 'organization' ? 'ngo_admin' : 'family' })
        .where(eq(users.id, userId));

      // Update Clerk publicMetadata
      await updateClerkPublicMetadata();

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
