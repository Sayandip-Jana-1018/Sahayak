import type { FastifyInstance } from 'fastify';
import { db, contentLibrary, users, eq } from '@sahayak/db';

function extractClerkId(authHeader?: string): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const payload = JSON.parse(Buffer.from(authHeader.slice(7).split('.')[1], 'base64url').toString('utf8'));
    return payload.sub || null;
  } catch { return null; }
}

export async function studioContentRoutes(app: FastifyInstance) {
  // GET /api/studio/content
  app.get('/studio/content', async (request, reply) => {
    try {
      const clerkId = extractClerkId(request.headers.authorization);
      if (!clerkId) return reply.status(401).send({ error: 'Unauthorized' });

      const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser || (dbUser.role !== 'ngo_admin' && dbUser.role !== 'sys_admin')) {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const items = await db.select().from(contentLibrary);
      return reply.send({ items });
    } catch (error: unknown) {
      app.log.error({ error }, 'Studio content GET error');
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  // POST /api/studio/content
  app.post('/studio/content', async (request, reply) => {
    try {
      const clerkId = extractClerkId(request.headers.authorization);
      if (!clerkId) return reply.status(401).send({ error: 'Unauthorized' });

      const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser || dbUser.role !== 'ngo_admin') return reply.status(403).send({ error: 'Forbidden' });

      const body = request.body as any;
      const orgId = dbUser.organizationId;
      if (!orgId) return reply.status(400).send({ error: 'No organization linked' });

      const [item] = await db.insert(contentLibrary).values({
        organizationId: orgId,
        category: body.category,
        name: body.name,
        phone: body.phone || null,
        address: body.address || null,
        state: body.state || null,
      }).returning();

      return reply.status(201).send(item);
    } catch (error: unknown) {
      app.log.error({ error }, 'Studio content POST error');
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  // DELETE /api/studio/content/:id
  app.delete('/studio/content/:id', async (request, reply) => {
    try {
      const clerkId = extractClerkId(request.headers.authorization);
      if (!clerkId) return reply.status(401).send({ error: 'Unauthorized' });

      const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser || dbUser.role !== 'ngo_admin') return reply.status(403).send({ error: 'Forbidden' });

      const { id } = request.params as { id: string };
      await db.delete(contentLibrary).where(eq(contentLibrary.id, id));

      return reply.send({ success: true });
    } catch (error: unknown) {
      app.log.error({ error }, 'Studio content DELETE error');
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
}
