import type { FastifyInstance } from 'fastify';
import { db, customVoiceCommands, users, eq } from '@sahayak/db';

function extractClerkId(authHeader?: string): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const payload = JSON.parse(Buffer.from(authHeader.slice(7).split('.')[1], 'base64url').toString('utf8'));
    return payload.sub || null;
  } catch { return null; }
}

export async function studioCommandsRoutes(app: FastifyInstance) {
  // GET /api/studio/commands
  app.get('/studio/commands', async (request, reply) => {
    try {
      const clerkId = extractClerkId(request.headers.authorization);
      if (!clerkId) return reply.status(401).send({ error: 'Unauthorized' });

      const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser || (dbUser.role !== 'ngo_admin' && dbUser.role !== 'sys_admin')) {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const commands = await db.select().from(customVoiceCommands);
      return reply.send({ commands });
    } catch (error: unknown) {
      app.log.error({ error }, 'Studio commands GET error');
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  // POST /api/studio/commands
  app.post('/studio/commands', async (request, reply) => {
    try {
      const clerkId = extractClerkId(request.headers.authorization);
      if (!clerkId) return reply.status(401).send({ error: 'Unauthorized' });

      const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser || dbUser.role !== 'ngo_admin') return reply.status(403).send({ error: 'Forbidden' });

      const body = request.body as any;
      const orgId = dbUser.organizationId;
      if (!orgId) return reply.status(400).send({ error: 'No organization linked' });

      const [cmd] = await db.insert(customVoiceCommands).values({
        organizationId: orgId,
        triggerPhrase: body.triggerPhrase,
        responseType: body.responseType,
        responseValue: body.responseValue,
        language: body.language || 'hi',
      }).returning();

      return reply.status(201).send(cmd);
    } catch (error: unknown) {
      app.log.error({ error }, 'Studio commands POST error');
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  // DELETE /api/studio/commands/:id
  app.delete('/studio/commands/:id', async (request, reply) => {
    try {
      const clerkId = extractClerkId(request.headers.authorization);
      if (!clerkId) return reply.status(401).send({ error: 'Unauthorized' });

      const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser || dbUser.role !== 'ngo_admin') return reply.status(403).send({ error: 'Forbidden' });

      const { id } = request.params as { id: string };
      await db.delete(customVoiceCommands).where(eq(customVoiceCommands.id, id));

      return reply.send({ success: true });
    } catch (error: unknown) {
      app.log.error({ error }, 'Studio commands DELETE error');
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
}
