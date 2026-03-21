import { Worker, type Job } from 'bullmq';
import IORedis from 'ioredis';

interface ReminderJobData {
  reminderId: string;
  elderlyProfileId: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string;
  phoneNumber: string;
  language: string;
}

const connection = process.env.REDIS_URL
  ? new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
  : null;

export function startReminderWorker() {
  if (!connection) {
    console.warn('⚠️  REDIS_URL not set — reminder worker disabled');
    return null;
  }

  const worker = new Worker<ReminderJobData>(
    'medication-reminders',
    async (job: Job<ReminderJobData>) => {
      const { reminderId, elderlyProfileId, medicineName, dosage, phoneNumber, language } = job.data;

      console.log(`💊 Sending reminder: ${medicineName} ${dosage} to ${phoneNumber}`);

      // In production: Twilio SMS / WhatsApp / Push notification
      // For now, log the reminder
      const reminderMessage = buildReminderMessage(medicineName, dosage, language);

      return {
        sent: true,
        channel: 'sms',
        reminderId,
        elderlyProfileId,
        message: reminderMessage,
        sentAt: new Date().toISOString(),
      };
    },
    {
      connection,
      concurrency: 5,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    }
  );

  worker.on('completed', (job) => {
    console.log(`✅ Reminder sent: ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Reminder failed: ${job?.id}`, err.message);
  });

  return worker;
}

function buildReminderMessage(medicineName: string, dosage: string, language: string): string {
  const messages: Record<string, string> = {
    hi: `🔔 सहायक: ${medicineName} ${dosage} लेने का समय हो गया है। कृपया अपनी दवाई लें।`,
    en: `🔔 Sahayak: Time to take ${medicineName} ${dosage}. Please take your medicine.`,
    ta: `🔔 சகாயக்: ${medicineName} ${dosage} எடுக்க நேரம் ஆகிவிட்டது.`,
    bn: `🔔 সহায়ক: ${medicineName} ${dosage} খাওয়ার সময় হয়েছে।`,
  };
  return messages[language] || messages.hi;
}
