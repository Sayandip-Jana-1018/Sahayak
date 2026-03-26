import type { FastifyInstance } from 'fastify';
import { db, users, organizations, eq, desc, count } from '@sahayak/db';

function extractClerkId(authHeader?: string): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const payload = JSON.parse(Buffer.from(authHeader.slice(7).split('.')[1], 'base64url').toString('utf8'));
    return payload.sub || null;
  } catch { return null; }
}

export async function adminOrganizationsRoutes(app: FastifyInstance) {
  // GET — list all organizations
  app.get('/admin/organizations', async (request, reply) => {
    try {
      const clerkId = extractClerkId(request.headers.authorization);
      if (!clerkId) return reply.status(401).send({ error: 'Unauthorized' });

      const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser || dbUser.role !== 'sys_admin') {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const allOrgs = await db.select().from(organizations).orderBy(desc(organizations.createdAt));

      return reply.send({
        organizations: allOrgs.map(o => ({
          ...o,
          createdAt: o.createdAt?.toISOString() || null,
          subscriptionValidUntil: o.subscriptionValidUntil?.toISOString() || null,
        })),
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Admin orgs error');
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  // POST — create organization
  app.post('/admin/organizations', async (request, reply) => {
    try {
      const clerkId = extractClerkId(request.headers.authorization);
      if (!clerkId) return reply.status(401).send({ error: 'Unauthorized' });

      const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser || dbUser.role !== 'sys_admin') {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const body = request.body as {
        name: string; type?: string; state?: string;
        contactEmail?: string; contactPhone?: string; deviceLimit?: number;
      };

      if (!body.name) return reply.status(400).send({ error: 'Name is required' });

      const [created] = await db.insert(organizations).values({
        name: body.name,
        type: (body.type as any) || 'ngo',
        state: body.state,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        deviceLimit: body.deviceLimit || 10,
      }).returning();

      return reply.status(201).send({ organization: { ...created, createdAt: created.createdAt?.toISOString() } });
    } catch (error: unknown) {
      app.log.error({ error }, 'Admin create org error');
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
}
