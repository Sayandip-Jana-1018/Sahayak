import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db, users, elderlyProfiles, caregiverLinks, eq, and } from '@sahayak/db';

const CreateProfileSchema = z.object({
  elderlyName: z.string().min(2),
  ageYears: z.number().min(1).max(120),
  state: z.string().min(1),
  district: z.string().optional().default(''),
  primaryLanguage: z.enum(['hi', 'ta', 'bn', 'mr', 'te', 'kn', 'gu', 'pa', 'ml', 'ur', 'en']),
  emergencyContactName: z.string().optional().default(''),
  emergencyContactPhone: z.string().optional().default(''),
  userType: z.enum(['family', 'self', 'organization']).optional().default('family'),
});

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

export async function createProfileRoutes(app: FastifyInstance) {
  /**
   * POST /api/onboarding/create-profile
   *
   * Creates the elderly_profile + caregiver_link at end of Step 2.
   * This allows Steps 3 (voice upload) and 4 (device polling) to
   * reference the profile BEFORE onboarding completes at Step 5.
   *
   * Idempotent: if profile already exists for this caregiver with same name,
   * returns the existing ID instead of creating a duplicate.
   */
  app.post('/onboarding/create-profile', async (request, reply) => {
    try {
      const parsed = CreateProfileSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Validation Error',
          message: parsed.error.issues.map((i) => i.message).join(', '),
        });
      }

      const data = parsed.data;
      const clerkId = extractClerkId(request.headers.authorization);
      if (!clerkId) {
        return reply.status(401).send({ statusCode: 401, error: 'Unauthorized' });
      }

      // Find or create user in DB
      let [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser) {
        const [newUser] = await db.insert(users).values({
          clerkId,
          role: data.userType === 'organization' ? 'ngo_admin' : 'family',
        }).returning();
        dbUser = newUser;
      }

      // Idempotency: check if a profile with this exact name already exists for this user
      const existingLinks = await db.select({
        elderlyProfileId: caregiverLinks.elderlyProfileId,
      })
        .from(caregiverLinks)
        .where(eq(caregiverLinks.caregiverId, dbUser.id));

      for (const link of existingLinks) {
        const [existingProfile] = await db.select()
          .from(elderlyProfiles)
          .where(and(
            eq(elderlyProfiles.id, link.elderlyProfileId),
            eq(elderlyProfiles.name, data.elderlyName),
          ))
          .limit(1);

        if (existingProfile) {
          return reply.send({
            elderlyProfileId: existingProfile.id,
            isExisting: true,
          });
        }
      }

      // Create the elderly profile
      const [newProfile] = await db.insert(elderlyProfiles).values({
        createdByUserId: dbUser.id,
        name: data.elderlyName,
        ageYears: data.ageYears,
        state: data.state,
        city: data.district,
        primaryLanguage: data.primaryLanguage,
        phoneNumber: data.emergencyContactPhone || null,
        isActive: true,
      }).returning();

      // Create the caregiver link
      const relationship = data.userType === 'self' ? 'self'
        : data.userType === 'organization' ? 'organization'
        : 'family';

      await db.insert(caregiverLinks).values({
        caregiverId: dbUser.id,
        elderlyProfileId: newProfile.id,
        relationship,
        priority: 1,
      });

      return reply.send({
        elderlyProfileId: newProfile.id,
        isExisting: false,
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Create profile error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to create profile',
      });
    }
  });
}
