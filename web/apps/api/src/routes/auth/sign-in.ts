// DEV_ONLY: Development sign-in bridge for Flutter app.
// Social sign-in uses Clerk OAuth in the browser, then exchanges the Clerk
// session token for the same app JWT shape used by the mobile app/API.

import type { FastifyInstance } from 'fastify';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { db, eq, users } from '@sahayak/db';
import { z } from 'zod';

const signInSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(6),
});

const socialExchangeSchema = z.object({
  clerkToken: z.string().min(1),
});

type ClerkUserSummary = {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
};

async function getOrCreateDbUser(clerkUser: ClerkUserSummary) {
  let [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);

  if (!dbUser) {
    const [newUser] = await db
      .insert(users)
      .values({
        clerkId: clerkUser.id,
        email: clerkUser.email,
        fullName: clerkUser.fullName,
        phone: clerkUser.phone,
        role: 'family',
        onboardingComplete: false,
      })
      .returning();
    dbUser = newUser;
  }

  return dbUser;
}

function createAppSessionToken(
  app: FastifyInstance,
  params: {
    clerkId: string;
    email: string | null;
    dbUserId: string;
  },
) {
  return app.jwt.sign(
    {
      sub: params.clerkId,
      email: params.email,
      dbId: params.dbUserId,
    },
    { expiresIn: '7d' },
  );
}

function buildUserResponse(dbUser: any, clerkUser: ClerkUserSummary) {
  return {
    id: dbUser.id,
    clerkId: clerkUser.id,
    email: dbUser.email,
    phone: dbUser.phone,
    fullName: dbUser.fullName,
    avatarUrl: dbUser.avatarUrl,
    role: dbUser.role,
    organizationId: dbUser.organizationId,
    onboardingComplete: dbUser.onboardingComplete,
  };
}

export async function signInRoutes(app: FastifyInstance) {
  const clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY!,
  });

  app.post('/sign-in', async (request, reply) => {
    const parsed = signInSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: parsed.error.issues.map((issue) => issue.message).join(', '),
      });
    }

    const { identifier, password } = parsed.data;

    try {
      const clerkUsers = await clerk.users.getUserList({
        emailAddress: [identifier],
      });

      if (!clerkUsers.data || clerkUsers.data.length === 0) {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid email or password. Please try again.',
        });
      }

      const clerkUser = clerkUsers.data[0];

      try {
        await clerk.users.verifyPassword({
          userId: clerkUser.id,
          password,
        });
      } catch {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid email or password. Please try again.',
        });
      }

      const fullName = [clerkUser.firstName, clerkUser.lastName]
        .filter((value): value is string => Boolean(value))
        .join(' ')
        .trim();

      const clerkUserSummary: ClerkUserSummary = {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || identifier,
        fullName: fullName.length === 0 ? null : fullName,
        phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
      };

      const dbUser = await getOrCreateDbUser(clerkUserSummary);
      const token = createAppSessionToken(app, {
        clerkId: clerkUserSummary.id,
        email: clerkUserSummary.email,
        dbUserId: dbUser.id,
      });

      return reply.send({
        token,
        user: buildUserResponse(dbUser, clerkUserSummary),
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Sign-in error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Sign-in failed. Please try again later.',
      });
    }
  });

  app.post('/social-exchange', async (request, reply) => {
    const parsed = socialExchangeSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: parsed.error.issues.map((issue) => issue.message).join(', '),
      });
    }

    try {
      const claims = await verifyToken(parsed.data.clerkToken, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });
      const clerkId = claims.sub;

      if (!clerkId || typeof clerkId !== 'string') {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid Clerk session token.',
        });
      }

      const clerkUser = await clerk.users.getUser(clerkId);
      const fullName = [clerkUser.firstName, clerkUser.lastName]
        .filter((value): value is string => Boolean(value))
        .join(' ')
        .trim();
      const clerkUserSummary: ClerkUserSummary = {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? null,
        fullName: fullName.length === 0 ? null : fullName,
        phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
      };

      const dbUser = await getOrCreateDbUser(clerkUserSummary);
      const token = createAppSessionToken(app, {
        clerkId: clerkUserSummary.id,
        email: clerkUserSummary.email,
        dbUserId: dbUser.id,
      });

      return reply.send({
        token,
        user: buildUserResponse(dbUser, clerkUserSummary),
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Social exchange error');
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Social sign-in could not be completed.',
      });
    }
  });
}
