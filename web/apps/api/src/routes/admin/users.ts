import type { FastifyInstance } from 'fastify';
import { db, users, eq, count, desc } from '@sahayak/db';

function extractClerkId(authHeader?: string): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const payload = JSON.parse(Buffer.from(authHeader.slice(7).split('.')[1], 'base64url').toString('utf8'));
    return payload.sub || null;
  } catch { return null; }
}

export async function adminUsersRoutes(app: FastifyInstance) {
  app.get('/admin/users', async (request, reply) => {
    try {
      const clerkId = extractClerkId(request.headers.authorization);
      if (!clerkId) return reply.status(401).send({ error: 'Unauthorized' });

      const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser || dbUser.role !== 'sys_admin') {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const allUsers = await db.select({
        id: users.id,
        clerkId: users.clerkId,
        email: users.email,
        phone: users.phone,
        fullName: users.fullName,
        avatarUrl: users.avatarUrl,
        role: users.role,
        onboardingComplete: users.onboardingComplete,
        createdAt: users.createdAt,
      }).from(users).orderBy(desc(users.createdAt));

      return reply.send({
        users: allUsers.map(u => ({
          ...u,
          createdAt: u.createdAt?.toISOString() || null,
        })),
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Admin users error');
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  // PUT — update user role
  app.put('/admin/users/:id/role', async (request, reply) => {
    try {
      const clerkId = extractClerkId(request.headers.authorization);
      if (!clerkId) return reply.status(401).send({ error: 'Unauthorized' });

      const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser || dbUser.role !== 'sys_admin') {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const { id } = request.params as { id: string };
      const { role } = request.body as { role: string };

      const validRoles = ['family', 'elderly', 'ngo_admin', 'sys_admin'];
      if (!validRoles.includes(role)) {
        return reply.status(400).send({ error: 'Invalid role' });
      }

      const [updated] = await db.update(users).set({ role: role as any }).where(eq(users.id, id)).returning();
      if (!updated) return reply.status(404).send({ error: 'User not found' });

      return reply.send({ success: true, user: { id: updated.id, role: updated.role } });
    } catch (error: unknown) {
      app.log.error({ error }, 'Admin role update error');
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
}
