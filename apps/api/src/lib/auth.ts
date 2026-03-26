import type { FastifyReply } from 'fastify';
import { and, caregiverLinks, db, eq, users } from '@sahayak/db';

export function getClerkIdFromRequest(request: any): string | undefined {
  return request.user?.sub ?? request.user?.userId;
}

export async function requireDbUser(request: any, reply: FastifyReply) {
  const clerkId = getClerkIdFromRequest(request);
  if (!clerkId) {
    reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid or expired authentication token',
    });
    return null;
  }

  const [dbUser] = await db
    .select({
      id: users.id,
      clerkId: users.clerkId,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (!dbUser) {
    reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'User not found',
    });
    return null;
  }

  return dbUser;
}

export async function requireCaregiverAccess(
  request: any,
  reply: FastifyReply,
  elderlyProfileId: string | undefined | null,
) {
  if (!elderlyProfileId) {
    reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'elderlyProfileId is required',
    });
    return null;
  }

  const dbUser = await requireDbUser(request, reply);
  if (!dbUser) return null;

  const [link] = await db
    .select({
      id: caregiverLinks.id,
      elderlyProfileId: caregiverLinks.elderlyProfileId,
      caregiverId: caregiverLinks.caregiverId,
      relationship: caregiverLinks.relationship,
      priority: caregiverLinks.priority,
      sosEnabled: caregiverLinks.sosEnabled,
      locationAccess: caregiverLinks.locationAccess,
    })
    .from(caregiverLinks)
    .where(and(
      eq(caregiverLinks.caregiverId, dbUser.id),
      eq(caregiverLinks.elderlyProfileId, elderlyProfileId),
    ))
    .limit(1);

  if (!link) {
    reply.status(403).send({
      statusCode: 403,
      error: 'Forbidden',
      message: 'You do not have access to this elderly profile',
    });
    return null;
  }

  return { dbUser, link };
}

export async function getFirstLinkedProfileId(userId: string) {
  const [link] = await db
    .select({ elderlyProfileId: caregiverLinks.elderlyProfileId })
    .from(caregiverLinks)
    .where(eq(caregiverLinks.caregiverId, userId))
    .limit(1);

  return link?.elderlyProfileId ?? null;
}
