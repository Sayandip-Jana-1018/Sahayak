import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { db, users, eq } from '@sahayak/db';

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string }>;
    phone_numbers?: Array<{ phone_number: string }>;
    first_name?: string;
    last_name?: string;
    image_url?: string;
  };
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET not set');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  // Get Svix headers
  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify signature
  const wh = new Webhook(WEBHOOK_SECRET);
  let event: ClerkWebhookEvent;

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  // Handle events
  const { type, data } = event;
  const clerkId = data.id;
  const email = data.email_addresses?.[0]?.email_address || null;
  const phone = data.phone_numbers?.[0]?.phone_number || null;
  const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ') || null;

  try {
    switch (type) {
      case 'user.created': {
        await db.insert(users).values({
          clerkId,
          email,
          phone,
          fullName,
          avatarUrl: data.image_url || null,
        }).onConflictDoNothing();
        console.log(`✅ User created: ${clerkId} (${email})`);
        break;
      }

      case 'user.updated': {
        await db.update(users)
          .set({
            email,
            phone,
            fullName,
            avatarUrl: data.image_url || null,
          })
          .where(eq(users.clerkId, clerkId));
        console.log(`✅ User updated: ${clerkId}`);
        break;
      }

      case 'user.deleted': {
        // Soft delete — keep data, set deletedAt
        await db.update(users)
          .set({ deletedAt: new Date() })
          .where(eq(users.clerkId, clerkId));
        console.log(`✅ User soft-deleted: ${clerkId}`);
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${type}`);
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error(`Webhook handler error for ${type}:`, error);
    return new Response('Internal error', { status: 500 });
  }
}
