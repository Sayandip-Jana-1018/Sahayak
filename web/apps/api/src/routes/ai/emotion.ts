import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const emotionSchema = z.object({
  frameBase64: z.string().min(1),
  elderlyProfileId: z.string().uuid(),
});

export async function emotionRoutes(app: FastifyInstance) {
  app.post('/emotion', {
    config: {
      rateLimit: {
        max: 2,
        timeWindow: '1 minute',
      },
    },
  }, async (request, reply) => {
    const parsed = emotionSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: parsed.error.issues.map(i => i.message).join(', '),
      });
    }

    const { frameBase64, elderlyProfileId } = parsed.data;

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const imagePart = {
        inlineData: {
          data: frameBase64,
          mimeType: 'image/jpeg',
        },
      };

      const result = await model.generateContent([
        `Analyze the facial expression in this image. Return ONLY valid JSON:
{
  "emotion": "happy|sad|confused|frustrated|neutral|angry|surprised",
  "confidence": 0.0 to 1.0,
  "needs_simplified_ui": true/false,
  "needs_caregiver_alert": true/false
}
Set needs_simplified_ui to true if confused or frustrated with confidence > 0.7.
Set needs_caregiver_alert to true if sad/angry with high confidence, suggesting distress.`,
        imagePart,
      ]);

      const responseText = result.response.text();
      let emotionData;
      try {
        const cleaned = responseText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        emotionData = JSON.parse(cleaned);
      } catch {
        emotionData = {
          emotion: 'neutral',
          confidence: 0,
          needs_simplified_ui: false,
          needs_caregiver_alert: false,
        };
      }

      return reply.send({
        ...emotionData,
        elderlyProfileId,
        analyzedAt: new Date().toISOString(),
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Emotion analysis error');
      return reply.send({
        emotion: 'neutral',
        confidence: 0,
        needs_simplified_ui: false,
        needs_caregiver_alert: false,
        elderlyProfileId,
        analyzedAt: new Date().toISOString(),
      });
    }
  });
}
