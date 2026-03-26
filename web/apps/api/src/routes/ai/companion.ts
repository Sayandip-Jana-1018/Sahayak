import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const companionSchema = z.object({
  message: z.string().min(1).max(1000),
  language: z.string().default('hi'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().default([]),
});

export async function companionRoutes(app: FastifyInstance) {
  app.post('/companion', async (request, reply) => {
    const parsed = companionSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: parsed.error.issues.map(i => i.message).join(', '),
      });
    }

    const { message, language, conversationHistory } = parsed.data;

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const systemPrompt = `You are "Dost" (दोस्त), the Sahayak Companion AI.
You are a warm, empathetic friend to elderly Indians.
You speak in ${language}. Keep responses short (2-3 sentences).
You can: chat about their day, tell stories, recite poetry, discuss news,
share health tips, and provide emotional support.
NEVER give medical diagnoses. For health concerns, suggest calling their doctor.
Be respectful — use "aap" (formal you) in Hindi.
Detect loneliness cues and respond with extra warmth and engagement.`;

      const history = conversationHistory.map(h => `${h.role === 'user' ? 'User' : 'Dost'}: ${h.content}`).join('\n');

      const result = await model.generateContent(
        `${systemPrompt}\n\nConversation so far:\n${history}\n\nUser: ${message}\n\nDost:`
      );

      const responseText = result.response.text();

      const lonelinessKeywords = /akela|lonely|bored|koi nahi|miss|bore|udas|sad|alone/i;
      const isLonely = lonelinessKeywords.test(message);

      return reply.send({
        response: responseText,
        mood_detected: isLonely ? 'lonely' : 'normal',
        should_alert_caregiver: isLonely,
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'Companion AI error');
      return reply.status(502).send({
        statusCode: 502,
        error: 'AI Service Error',
        message: 'Dost is taking a short break. Please try again.',
      });
    }
  });
}
