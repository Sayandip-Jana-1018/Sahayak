import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db, users, elderlyProfiles, voiceProfileSamples, caregiverLinks, eq } from '@sahayak/db';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder-key';

const supabase = createClient(supabaseUrl, supabaseKey);

/** Rough quality score based on blob size proxy for amplitude + duration */
function estimateQuality(fileSizeBytes: number): number {
  // Below 5KB = likely silence/noise (too short or too quiet)
  if (fileSizeBytes < 5_000) return 0.2;
  // 5KB–20KB = marginal
  if (fileSizeBytes < 20_000) return 0.5;
  // 20KB–100KB = reasonable (3–5s speech at 128kbps)
  if (fileSizeBytes < 100_000) return 0.75;
  // 100KB+ = good
  return 0.9;
}

export async function voiceProfileRoutes(app: FastifyInstance) {
  app.post('/voice-profile/upload-sample', async (request, reply) => {
    try {
      const clerkId = (request as any).user?.sub ?? (request as any).user?.userId;
      if (!clerkId) return reply.status(401).send({ statusCode: 401, error: 'Unauthorized' });

      const [dbUser] = await db.select({ id: users.id }).from(users).where(eq(users.clerkId, clerkId)).limit(1);
      if (!dbUser) return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'User not found' });

      // Get caregiver's elderly profile
      const [link] = await db.select({ elderlyProfileId: caregiverLinks.elderlyProfileId })
        .from(caregiverLinks).where(eq(caregiverLinks.caregiverId, dbUser.id)).limit(1);
      if (!link) return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: 'No elderly profile linked. Complete onboarding first.' });

      const data = await request.file();
      if (!data) return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: 'No file provided' });

      const sampleIndexStr = data.fields?.sampleIndex as { value?: string } | undefined;
      const sampleIndex = parseInt(sampleIndexStr?.value ?? '0', 10);
      if (isNaN(sampleIndex) || sampleIndex < 0 || sampleIndex > 2) {
        return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: 'sampleIndex must be 0, 1, or 2' });
      }

      const buffer = await data.toBuffer();
      const quality = estimateQuality(buffer.length);

      // Upload to Supabase Storage
      const storagePath = `voice-samples/${dbUser.id}/${sampleIndex}.webm`;
      const { error: uploadError } = await supabase.storage
        .from('sahayak-media')
        .upload(storagePath, buffer, {
          contentType: 'audio/webm',
          upsert: true,
        });

      if (uploadError) {
        app.log.error({ uploadError }, 'Supabase voice sample upload failed');
        // Don't fail the request — return low quality so frontend can retry
        return reply.send({ sampleId: null, quality: 0.1, storageUrl: null });
      }

      const { data: urlData } = supabase.storage.from('sahayak-media').getPublicUrl(storagePath);
      const storageUrl = urlData.publicUrl;

      // Upsert into voice_profile_samples
      const existing = await db.select({ id: voiceProfileSamples.id })
        .from(voiceProfileSamples)
        .where(eq(voiceProfileSamples.elderlyProfileId, link.elderlyProfileId))
        .limit(10);

      const existingSample = existing.find((_, i) => i === sampleIndex);

      let sampleId: string;
      if (existingSample) {
        const [updated] = await db.update(voiceProfileSamples)
          .set({ storageUrl, quality: String(quality), language: (data.fields?.language as { value?: string })?.value ?? 'hi' })
          .where(eq(voiceProfileSamples.id, existingSample.id))
          .returning({ id: voiceProfileSamples.id });
        sampleId = updated.id;
      } else {
        const [created] = await db.insert(voiceProfileSamples).values({
          elderlyProfileId: link.elderlyProfileId,
          sampleIndex,
          storageUrl,
          quality: String(quality),
          language: (data.fields?.language as { value?: string })?.value ?? 'hi',
        }).returning({ id: voiceProfileSamples.id });
        sampleId = created.id;
      }

      return reply.send({ sampleId, quality, storageUrl });
    } catch (err) {
      app.log.error({ err }, 'Voice profile upload error');
      return reply.status(500).send({ statusCode: 500, error: 'Internal Server Error', message: 'Failed to upload voice sample' });
    }
  });
}
