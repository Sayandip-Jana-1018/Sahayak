// DEV_ONLY: Development sign-in bridge for Flutter app.
// TODO: Replace with Clerk WebView flow (flutter_web_auth_2) before production launch.
// This route accepts email/password, verifies via Clerk Backend API,
// and returns a signed JWT that the Flutter app can use for all API calls.

import type { FastifyInstance } from 'fastify';
import { createClerkClient } from '@clerk/backend';
import { db, users, eq } from '@sahayak/db';
import { z } from 'zod';

const signInSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(6),
});

export async function signInRoutes(app: FastifyInstance) {
  const clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY!,
  });

  // DEV_ONLY: POST /api/auth/sign-in
  app.post('/sign-in', async (request, reply) => {
    const parsed = signInSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: parsed.error.issues.map((i) => i.message).join(', '),
      });
    }

    const { identifier, password } = parsed.data;

    try {
      // Step 1: Verify credentials via Clerk Backend API
      // Use Clerk's user list to find the user by email, then verify password
      const clerkUsers = await clerk.users.getUserList({
        emailAddress: [identifier],
      });

      if (!clerkUsers.data || clerkUsers.data.length === 0) {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'गलत ईमेल या पासवर्ड। कृपया फिर से कोशिश करें।',
        });
      }

      const clerkUser = clerkUsers.data[0];

      // Step 2: Verify password using Clerk's verifyPassword
      try {
        await clerk.users.verifyPassword({
          userId: clerkUser.id,
          password,
        });
      } catch {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'गलत ईमेल या पासवर्ड। कृपया फिर से कोशिश करें।',
        });
      }

      // Step 3: Get or create the user in our DB
      let [dbUser] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUser.id))
        .limit(1);

      if (!dbUser) {
        // Auto-create user in our DB on first sign-in from Flutter
        const [newUser] = await db
          .insert(users)
          .values({
            clerkId: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || identifier,
            fullName:
              [clerkUser.firstName, clerkUser.lastName]
                .filter(Boolean)
                .join(' ') || null,
            phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
            role: 'family',
            onboardingComplete: false,
          })
          .returning();
        dbUser = newUser;
      }

      // Step 4: Sign JWT with payload matching what profile route expects
      // The profile route extracts clerkId from request.user.sub
      const token = app.jwt.sign(
        {
          sub: clerkUser.id, // "user_2abc..." — Clerk user ID
          email: clerkUser.emailAddresses[0]?.emailAddress,
          dbId: dbUser.id,
        },
        { expiresIn: '7d' }
      );

      return reply.send({
        token,
        user: {
          id: dbUser.id,
          clerkId: clerkUser.id,
          email: dbUser.email,
          phone: dbUser.phone,
          fullName: dbUser.fullName,
          avatarUrl: dbUser.avatarUrl,
          role: dbUser.role,
          organizationId: dbUser.organizationId,
          onboardingComplete: dbUser.onboardingComplete,
        },
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Sign-in error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'साइन-इन में त्रुटि हुई। कृपया बाद में कोशिश करें।',
      });
    }
  });
}
