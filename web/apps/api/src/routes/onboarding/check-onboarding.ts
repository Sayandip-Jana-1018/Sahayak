import type { FastifyInstance } from 'fastify';
import { db, users, elderlyProfiles, caregiverLinks, eq } from '@sahayak/db';

/**
 * Extract Clerk User ID from Bearer JWT payload (sub claim).
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

export async function onboardingStatusRoutes(app: FastifyInstance) {
  /**
   * GET /api/onboarding/status
   * Returns whether the current user has completed onboarding.
   * Now returns ALL elderly profiles the caregiver is linked to.
   */
  app.get('/onboarding/status', async (request, reply) => {
    try {
      const clerkId = extractClerkId(request.headers.authorization);
      if (!clerkId) {
        return reply.status(401).send({ statusCode: 401, error: 'Unauthorized' });
      }

      // Find user in DB
      const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser) {
        return reply.send({ onboarded: false, profiles: [] });
      }

      // Get ALL caregiver links (not just first)
      const links = await db.select({
        linkId: caregiverLinks.id,
        elderlyProfileId: caregiverLinks.elderlyProfileId,
        relationship: caregiverLinks.relationship,
      })
        .from(caregiverLinks)
        .where(eq(caregiverLinks.caregiverId, dbUser.id));

      // Also get profiles created directly by user (orphans without link)
      const directProfiles = await db.select()
        .from(elderlyProfiles)
        .where(eq(elderlyProfiles.createdByUserId, dbUser.id));

      // Merge: linked profile IDs + direct profile IDs
      const linkedIds = new Set(links.map(l => l.elderlyProfileId));
      const allProfileIds = new Set([...linkedIds, ...directProfiles.map(p => p.id)]);

      if (allProfileIds.size === 0) {
        return reply.send({ onboarded: false, profiles: [] });
      }

      // Fetch full profile data for all IDs
      const profiles = await Promise.all(
        Array.from(allProfileIds).map(async (pid) => {
          const [p] = await db.select().from(elderlyProfiles)
            .where(eq(elderlyProfiles.id, pid)).limit(1);
          if (!p) return null;

          // Find the relationship if linked
          const link = links.find(l => l.elderlyProfileId === pid);

          return {
            id: p.id,
            name: p.name,
            ageYears: p.ageYears,
            city: p.city,
            state: p.state,
            primaryLanguage: p.primaryLanguage,
            phoneNumber: p.phoneNumber,
            isActive: p.isActive,
            relationship: link?.relationship || 'self',
            lastActiveAt: p.lastActiveAt?.toISOString() || null,
          };
        })
      );

      const validProfiles = profiles.filter(Boolean);

      return reply.send({
        onboarded: validProfiles.length > 0,
        profiles: validProfiles,
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Onboarding status check error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to check onboarding status',
      });
    }
  });
}
