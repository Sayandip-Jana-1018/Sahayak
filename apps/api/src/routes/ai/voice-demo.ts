import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const SUPPORTED_LANGUAGES = ['hi', 'ta', 'bn', 'mr', 'te', 'kn', 'gu', 'pa', 'ml', 'ur', 'en'] as const;

const voiceDemoSchema = z.object({
  text: z.string().min(1, 'Text is required').max(500, 'Text too long'),
  language: z.enum(SUPPORTED_LANGUAGES),
});

const VOICE_MAP: Record<string, string> = {
  hi: 'hi-IN-SwaraNeural',
  ta: 'ta-IN-PallaviNeural',
  bn: 'bn-IN-TanishaaNeural',
  mr: 'mr-IN-AarohiNeural',
  te: 'te-IN-ShrutiNeural',
  kn: 'kn-IN-SapnaNeural',
  gu: 'gu-IN-DhwaniNeural',
  pa: 'pa-IN-GurleenNeural',
  ml: 'ml-IN-SobhanaNeural',
  ur: 'ur-IN-GulNeural',
  en: 'en-IN-NeerjaNeural',
};

const LANGUAGE_NAMES: Record<string, string> = {
  hi: 'Hindi', ta: 'Tamil', bn: 'Bengali', mr: 'Marathi',
  te: 'Telugu', kn: 'Kannada', gu: 'Gujarati', pa: 'Punjabi',
  ml: 'Malayalam', ur: 'Urdu', en: 'English',
};

function buildSystemPrompt(language: string): string {
  const langName = LANGUAGE_NAMES[language] || 'Hindi';
  return `You are Sahayak (सहायक), a warm elderly care AI assistant for India.
The user is an elderly Indian person speaking to you via voice.
Respond in EXACTLY the same language as the input: ${langName} (${language}).
Keep response to maximum 2 short sentences — simple words, no jargon.
If they want to send money, simulate: confirm the amount and recipient warmly.
If emergency, simulate: reassure them help is on the way and family is notified.
If medicine, simulate: confirm the reminder is set with the time.
Be warm, like a trusted family member. Never use English technical terms.`;
}

function detectIntent(text: string): string {
  const lower = text.toLowerCase();
  if (/pay|send|money|paisa|bhej|rupee|₹|upi|transfer/i.test(lower)) return 'payment';
  if (/emergency|help|ambulance|hospital|sos|bachao|madad/i.test(lower)) return 'emergency';
  if (/medicine|tablet|dawai|dawa|goli|reminder|yaad/i.test(lower)) return 'medicine';
  if (/call|phone|dial|ring|bol|baat/i.test(lower)) return 'call';
  return 'general';
}

export async function voiceDemoRoutes(app: FastifyInstance) {
  app.post('/voice-demo', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute',
      },
    },
  }, async (request, reply) => {
    const startTime = Date.now();

    const parsed = voiceDemoSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: parsed.error.issues.map(i => i.message).join(', '),
        details: parsed.error.issues,
      });
    }

    const { text, language } = parsed.data;
    const intent = detectIntent(text);

    try {
      // Gemini API call
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const systemPrompt = buildSystemPrompt(language);
      const result = await model.generateContent(`${systemPrompt}\n\nUser says: "${text}"`);
      const responseText = result.response.text();

      const processingMs = Date.now() - startTime;

      return reply.send({
        response_text: responseText,
        audio_base64: null, // TTS integration placeholder — edge-tts would generate this
        intent,
        language,
        voice: VOICE_MAP[language],
        processing_ms: processingMs,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'AI processing failed';
      app.log.error({ error, text, language }, 'Voice demo AI error');

      return reply.status(502).send({
        statusCode: 502,
        error: 'AI Service Error',
        message: 'The AI service is temporarily unavailable. Please try again.',
        fallback_response: 'मैं अभी उपलब्ध नहीं हूँ। कृपया थोड़ी देर बाद कोशिश करें।',
        intent,
        processing_ms: Date.now() - startTime,
      });
    }
  });
}
