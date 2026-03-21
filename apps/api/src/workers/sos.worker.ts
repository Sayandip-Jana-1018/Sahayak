import { Worker, type Job } from 'bullmq';
import IORedis from 'ioredis';

interface SOSJobData {
  sosEventId: string;
  elderlyProfileId: string;
  location: { lat: number; lng: number };
  triggerType: string;
  severity: string;
  caregiverContacts: Array<{
    userId: string;
    phone: string;
    name: string;
    priority: number;
  }>;
}

const connection = process.env.REDIS_URL
  ? new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
  : null;

export function startSOSWorker() {
  if (!connection) {
    console.warn('⚠️  REDIS_URL not set — SOS worker disabled');
    return null;
  }

  const worker = new Worker<SOSJobData>(
    'sos-alerts',
    async (job: Job<SOSJobData>) => {
      const { sosEventId, elderlyProfileId, location, triggerType, severity, caregiverContacts } = job.data;

      console.log(`🚨 Processing SOS: ${sosEventId} | type=${triggerType} | severity=${severity}`);

      const googleMapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
      const notified: string[] = [];

      // Sort by priority, highest first
      const sorted = [...caregiverContacts].sort((a, b) => a.priority - b.priority);

      for (const contact of sorted) {
        // In production: Twilio SMS + WhatsApp + Push via Firebase
        console.log(`  📱 Notifying ${contact.name} (${contact.phone})`);
        notified.push(contact.userId);
      }

      return {
        sosEventId,
        elderlyProfileId,
        notified_count: notified.length,
        notified_user_ids: notified,
        location_url: googleMapsUrl,
        processedAt: new Date().toISOString(),
      };
    },
    {
      connection,
      concurrency: 10,
      removeOnComplete: { count: 200 },
      removeOnFail: { count: 100 },
    }
  );

  worker.on('completed', (job) => {
    console.log(`✅ SOS processed: ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ SOS worker failed: ${job?.id}`, err.message);
  });

  return worker;
}
