import type { FastifyInstance } from 'fastify';
import { Server as SocketIOServer } from 'socket.io';
import { createClerkClient } from '@clerk/backend';
import { and, db, users, caregiverLinks, eq } from '@sahayak/db';

let io: SocketIOServer | null = null;

export async function socketPlugin(app: FastifyInstance) {
  const origin = [
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    /\.sahayak\.in$/,
  ];

  io = new SocketIOServer(app.server as import('http').Server, {
    cors: {
      origin,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  const clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY ?? '',
  });

  // ── Auth middleware ───────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) {
        return next(new Error('Missing auth token'));
      }

      // DEV_ONLY: Decode JWT payload directly (our dev bridge signs with CLERK_SECRET_KEY)
      // In production, use Clerk's session verification
      let clerkId: string;
      try {
        const parts = token.split('.');
        if (parts.length !== 3) throw new Error('Invalid token');
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
        clerkId = payload.sub;
        if (!clerkId) throw new Error('No sub in token');
      } catch {
        return next(new Error('Invalid token format'));
      }

      // Look up DB user
      const [dbUser] = await db
        .select({ id: users.id, clerkId: users.clerkId })
        .from(users)
        .where(eq(users.clerkId, clerkId))
        .limit(1);

      if (!dbUser) {
        return next(new Error('User not found'));
      }

      socket.data.userId = dbUser.id;
      socket.data.clerkId = clerkId;
      return next();
    } catch (err) {
      app.log.warn({ err }, 'Socket auth failed');
      return next(new Error('Unauthorized'));
    }
  });

  // ── Connection handler ────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    app.log.info({ socketId: socket.id, userId: socket.data.userId }, 'Socket connected');

    // Always join a personal user room
    socket.join(`user:${socket.data.userId}`);

    // Caregiver joins their elderly profile room
    socket.on('join_dashboard', async ({ elderlyProfileId }: { elderlyProfileId: string }) => {
      try {
        // Verify this user is actually a caregiver for this profile
        const [link] = await db
          .select({ id: caregiverLinks.id })
          .from(caregiverLinks)
          .where(and(
            eq(caregiverLinks.caregiverId, socket.data.userId),
            eq(caregiverLinks.elderlyProfileId, elderlyProfileId),
          ))
          .limit(1);

        if (!link) {
          socket.emit('error', { message: 'Access denied to this elderly profile' });
          return;
        }

        await socket.join(`caregiver:${elderlyProfileId}`);
        socket.data.elderlyProfileId = elderlyProfileId;
        socket.emit('dashboard_joined', { elderlyProfileId });
        app.log.info({ userId: socket.data.userId, elderlyProfileId }, 'Joined dashboard room');
      } catch (err) {
        app.log.error({ err }, 'join_dashboard error');
        socket.emit('error', { message: 'Failed to join dashboard' });
      }
    });

    socket.on('leave_dashboard', ({ elderlyProfileId }: { elderlyProfileId: string }) => {
      socket.leave(`caregiver:${elderlyProfileId}`);
    });

    socket.on('disconnect', (reason) => {
      app.log.info({ socketId: socket.id, reason }, 'Socket disconnected');
    });
  });

  app.log.info('Socket.io plugin registered');
}

// ── Emitter helpers (used by routes and workers) ──────────────────────────────

/** Emit an event to all caregivers monitoring a given elderly profile. */
export function emitToCaregiver(
  elderlyProfileId: string,
  event: string,
  data: unknown,
): void {
  io?.to(`caregiver:${elderlyProfileId}`).emit(event, data);
}

/** Emit an event to a specific caregiver user. */
export function emitToUser(userId: string, event: string, data: unknown): void {
  io?.to(`user:${userId}`).emit(event, data);
}

/** Expose the raw io instance (for edge cases in workers). */
export function getIO(): SocketIOServer | null {
  return io;
}
