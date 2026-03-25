import * as cron from 'node-cron';
import IORedis from 'ioredis';
import { db, elderlyProfiles, caregiverLinks, users, eq, lte, isNull } from '@sahayak/db';
import { emitToCaregiver } from '../plugins/socket';

const LONELINESS_THRESHOLD_HOURS = 48;
const ALERT_COOLDOWN_HOURS = 24;

export function startLonelinessWorker() {
  const redis = process.env.REDIS_URL
    ? new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
    : null;

  if (!redis) {
    console.warn('⚠️  REDIS_URL not set — loneliness worker disabled');
    return null;
  }

  // Run every 6 hours
  const task = cron.schedule('0 */6 * * *', async () => {
    console.log('[Loneliness] Running check...');
    try {
      const threshold = new Date(Date.now() - LONELINESS_THRESHOLD_HOURS * 60 * 60 * 1000);

      // Find all elderly profiles that haven't been active in 48+ hours
      const inactiveProfiles = await db.select({
        id: elderlyProfiles.id,
        name: elderlyProfiles.name,
        lastActiveAt: elderlyProfiles.lastActiveAt,
        lonelinessDaysCount: elderlyProfiles.lonelinessDaysCount,
      })
        .from(elderlyProfiles)
        .where(lte(elderlyProfiles.lastActiveAt, threshold));

      for (const profile of inactiveProfiles) {
        const redisKey = `loneliness:${profile.id}`;
        const alreadySent = await redis.get(redisKey);

        if (alreadySent) continue; // Alert already sent within cooldown

        // Emit to caregivers
        emitToCaregiver(profile.id, 'loneliness_alert', {
          elderlyProfileId: profile.id,
          name: profile.name,
          lastActiveAt: profile.lastActiveAt?.toISOString() ?? null,
          inactiveHours: profile.lastActiveAt
            ? Math.round((Date.now() - new Date(profile.lastActiveAt).getTime()) / 3_600_000)
            : null,
        });

        // Set cooldown
        await redis.set(redisKey, '1', 'EX', ALERT_COOLDOWN_HOURS * 3600);

        // Increment loneliness days count
        await db.update(elderlyProfiles)
          .set({ lonelinessDaysCount: (profile.lonelinessDaysCount ?? 0) + 1 })
          .where(eq(elderlyProfiles.id, profile.id));

        console.log(`[Loneliness] Alert emitted for ${profile.name} (${profile.id})`);
      }

      console.log(`[Loneliness] Check complete. ${inactiveProfiles.length} inactive profiles found.`);
    } catch (err) {
      console.error('[Loneliness] Error:', err);
    }
  });

  console.log('[Workers] Loneliness cron worker started (every 6 hours)');
  return task;
}
