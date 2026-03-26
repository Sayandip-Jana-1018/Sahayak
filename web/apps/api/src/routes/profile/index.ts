import type { FastifyInstance } from 'fastify';
import { db, users, elderlyProfiles, caregiverLinks, eq } from '@sahayak/db';
import { z } from 'zod';

function extractClerkId(authHeader?: string): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const payload = JSON.parse(Buffer.from(authHeader.slice(7).split('.')[1], 'base64url').toString('utf8'));
    return payload.sub || null;
  } catch { return null; }
}

const updateProfileSchema = z.object({
  fullName: z.string().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

export async function profileRoutes(app: FastifyInstance) {
  // GET profile — real DB query
  app.get('/profile', async (request, reply) => {
    try {
      const clerkId = extractClerkId(request.headers.authorization);
      if (!clerkId) return reply.status(401).send({ error: 'Unauthorized' });

      const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser) return reply.status(404).send({ error: 'User not found' });

      // Get linked elderly profiles
      const links = await db.select({
        profileId: caregiverLinks.elderlyProfileId,
        relationship: caregiverLinks.relationship,
        profileName: elderlyProfiles.name,
        profileAge: elderlyProfiles.ageYears,
        profileLanguage: elderlyProfiles.primaryLanguage,
        profilePhone: elderlyProfiles.phoneNumber,
        isActive: elderlyProfiles.isActive,
      })
        .from(caregiverLinks)
        .innerJoin(elderlyProfiles, eq(caregiverLinks.elderlyProfileId, elderlyProfiles.id))
        .where(eq(caregiverLinks.caregiverId, dbUser.id));

      return reply.send({
        id: dbUser.id,
        email: dbUser.email,
        phone: dbUser.phone,
        fullName: dbUser.fullName,
        avatarUrl: dbUser.avatarUrl,
        role: dbUser.role,
        onboardingComplete: dbUser.onboardingComplete,
        createdAt: dbUser.createdAt?.toISOString() || null,
        elderlyProfiles: links.map(l => ({
          id: l.profileId,
          name: l.profileName,
          ageYears: l.profileAge,
          primaryLanguage: l.profileLanguage,
          phoneNumber: l.profilePhone,
          isActive: l.isActive,
          relationship: l.relationship,
        })),
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Profile fetch error');
      return reply.status(500).send({ statusCode: 500, error: 'Internal Server Error', message: 'Failed to fetch profile.' });
    }
  });

  // PUT update profile — real DB update
  app.put('/profile', async (request, reply) => {
    const parsed = updateProfileSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ statusCode: 400, error: 'Validation Error', message: parsed.error.issues.map(i => i.message).join(', ') });
    }

    try {
      const clerkId = extractClerkId(request.headers.authorization);
      if (!clerkId) return reply.status(401).send({ error: 'Unauthorized' });

      const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser) return reply.status(404).send({ error: 'User not found' });

      const [updated] = await db.update(users).set(parsed.data).where(eq(users.id, dbUser.id)).returning();

      return reply.send({
        id: updated.id,
        fullName: updated.fullName,
        phone: updated.phone,
        avatarUrl: updated.avatarUrl,
        updatedAt: updated.updatedAt?.toISOString() || new Date().toISOString(),
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Profile update error');
      return reply.status(500).send({ statusCode: 500, error: 'Internal Server Error', message: 'Failed to update profile.' });
    }
  });
}
