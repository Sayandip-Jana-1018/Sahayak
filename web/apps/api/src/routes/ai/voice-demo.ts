import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db, voiceCommandLogs } from '@sahayak/db';

const execFileAsync = promisify(execFile);

const SUPPORTED_LANGUAGES = ['hi', 'ta', 'bn', 'mr', 'te', 'kn', 'gu', 'pa', 'ml', 'ur', 'en'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

const textRequestSchema = z.object({
  text: z.string().min(1, 'Text is required').max(500, 'Text too long'),
  language: z.enum(SUPPORTED_LANGUAGES).default('hi'),
  elderlyProfileId: z.string().uuid().optional(),
});

const VOICE_MAP: Record<SupportedLanguage, string> = {
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

const LANG_MAP: Record<SupportedLanguage, string> = {
  hi: 'hi-IN',
  ta: 'ta-IN',
  bn: 'bn-IN',
  mr: 'mr-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  ml: 'ml-IN',
  ur: 'ur-IN',
  en: 'en-IN',
};

const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  hi: 'Hindi',
  ta: 'Tamil',
  bn: 'Bengali',
  mr: 'Marathi',
  te: 'Telugu',
  kn: 'Kannada',
  gu: 'Gujarati',
  pa: 'Punjabi',
  ml: 'Malayalam',
  ur: 'Urdu',
  en: 'English',
};

const OPENAI_TTS_VOICE_MAP: Record<SupportedLanguage, string> = {
  hi: 'alloy',
  ta: 'nova',
  bn: 'nova',
  mr: 'alloy',
  te: 'nova',
  kn: 'nova',
  gu: 'alloy',
  pa: 'alloy',
  ml: 'nova',
  ur: 'alloy',
  en: 'alloy',
};

function buildSystemPrompt(language: SupportedLanguage): string {
  return `You are Sahayak, a warm elderly care AI assistant for India.
Respond in exactly the same language as the input: ${LANGUAGE_NAMES[language]} (${language}).
Keep your response to a maximum of 2 short sentences. Use simple, warm, non-technical language.
If the user asks for medicine help, confirm the reminder clearly.
If the user asks for emergency help, reassure them that help is being alerted.
If the user asks about money, keep the reply cautious and confirm details, never invent success.
Speak like a trusted family member.`;
}

function detectIntent(text: string): string {
  const lower = text.toLowerCase();
  if (/pay|send|money|paisa|bhej|rupee|₹|upi|transfer/i.test(lower)) return 'payment';
  if (/emergency|help|ambulance|hospital|sos|bachao|madad/i.test(lower)) return 'emergency';
  if (/medicine|tablet|dawai|dawa|goli|reminder|yaad/i.test(lower)) return 'medicine';
  if (/call|phone|dial|ring|bol|baat/i.test(lower)) return 'call';
  if (/scheme|yojana|benefit|sarkari/i.test(lower)) return 'scheme';
  return 'general';
}

async function transcribeAudio(params: {
  audioBuffer: Buffer;
  filename: string;
  mimeType?: string;
  language: SupportedLanguage;
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for audio transcription');
  }

  const formData = new FormData();
  const blob = new Blob([new Uint8Array(params.audioBuffer)], {
    type: params.mimeType || 'audio/m4a',
  });

  formData.set('file', blob, params.filename);
  formData.set('model', 'whisper-1');
  formData.set('language', params.language);
  formData.set('response_format', 'verbose_json');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Whisper transcription failed: ${response.status} ${errorText}`);
  }

  const data = await response.json() as {
    text?: string;
    language?: string;
    duration?: number;
  };

  return {
    text: data.text?.trim() ?? '',
    language: (SUPPORTED_LANGUAGES.includes((data.language ?? params.language) as SupportedLanguage)
      ? (data.language as SupportedLanguage)
      : params.language),
    confidenceScore: data.text?.trim() ? 0.92 : 0.0,
  };
}

async function generateResponseText(text: string, language: SupportedLanguage) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash',
  });

  const prompt = `${buildSystemPrompt(language)}\n\nUser says: "${text}"`;
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

async function synthesizeWithEdgeTts(text: string, language: SupportedLanguage) {
  const voice = VOICE_MAP[language];
  const tmpPath = path.join(os.tmpdir(), `sahayak-tts-${Date.now()}.mp3`);
  const binCandidates = [
    path.resolve(process.cwd(), 'node_modules', '.bin', process.platform === 'win32' ? 'node-edge-tts.CMD' : 'node-edge-tts'),
    path.resolve(process.cwd(), 'node_modules', 'node-edge-tts', 'bin.js'),
  ];

  try {
    for (const candidate of binCandidates) {
      try {
        await fs.access(candidate);

        if (candidate.toLowerCase().endsWith('.cmd')) {
          await execFileAsync(candidate, ['-t', text, '-f', tmpPath, '-v', voice], {
            timeout: 20000,
            windowsHide: true,
          });
        } else {
          await execFileAsync(process.execPath, [candidate, '-t', text, '-f', tmpPath, '-v', voice], {
            timeout: 20000,
            windowsHide: true,
          });
        }

        const audioBuffer = await fs.readFile(tmpPath);
        return {
          audioBase64: audioBuffer.toString('base64'),
          voice,
          provider: 'edge-tts',
        };
      } catch {
        // Try the next Edge TTS candidate before falling back.
      }
    }
  } finally {
    await fs.unlink(tmpPath).catch(() => undefined);
  }

  throw new Error('Edge TTS synthesis failed');
}

async function synthesizeWithOpenAi(text: string, language: SupportedLanguage) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for speech synthesis fallback');
  }

  const requestedVoice = OPENAI_TTS_VOICE_MAP[language];
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini-tts',
      voice: requestedVoice,
      input: text,
      format: 'mp3',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI speech synthesis failed: ${response.status} ${errorText}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  return {
    audioBase64: audioBuffer.toString('base64'),
    voice: `openai:${requestedVoice}`,
    provider: 'openai-tts',
  };
}

async function synthesizeSpeech(text: string, language: SupportedLanguage) {
  try {
    return await synthesizeWithEdgeTts(text, language);
  } catch {
    return synthesizeWithOpenAi(text, language);
  }
}

async function logVoiceCommand(input: {
  elderlyProfileId?: string;
  commandText?: string;
  detectedIntent: string;
  language: string;
  wasSuccessful: boolean;
  confidenceScore?: number;
  processingMs: number;
  modelUsed: string;
}) {
  if (!input.elderlyProfileId) return;

  await db.insert(voiceCommandLogs).values({
    elderlyProfileId: input.elderlyProfileId,
    commandText: input.commandText,
    detectedIntent: input.detectedIntent,
    language: input.language,
    wasSuccessful: input.wasSuccessful,
    confidenceScore: input.confidenceScore != null ? input.confidenceScore.toFixed(3) : null,
    processingMs: input.processingMs,
    modelUsed: input.modelUsed,
  });
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
    const contentType = request.headers['content-type'] ?? '';
    const isAudioUpload = contentType.includes('multipart/form-data');

    if (isAudioUpload) {
      let elderlyProfileId: string | undefined;
      try {
        const file = await request.file();
        if (!file) {
          return reply.status(400).send({
            statusCode: 400,
            error: 'Validation Error',
            message: 'Audio file is required',
          });
        }

        const languageField = (file.fields.language as { value?: string } | undefined)?.value ?? 'hi';
        elderlyProfileId = (file.fields.elderlyProfileId as { value?: string } | undefined)?.value;
        const fallbackLanguage = (SUPPORTED_LANGUAGES.includes(languageField as SupportedLanguage)
          ? languageField
          : 'hi') as SupportedLanguage;

        const audioBuffer = await file.toBuffer();
        const transcription = await transcribeAudio({
          audioBuffer,
          filename: file.filename || `voice-${Date.now()}.m4a`,
          mimeType: file.mimetype,
          language: fallbackLanguage,
        });

        const intent = detectIntent(transcription.text);
        const responseText = await generateResponseText(transcription.text, transcription.language);
        const speech = await synthesizeSpeech(responseText, transcription.language);
        const processingMs = Date.now() - startTime;

        await logVoiceCommand({
          elderlyProfileId,
          commandText: transcription.text,
          detectedIntent: intent,
          language: transcription.language,
          wasSuccessful: true,
          confidenceScore: transcription.confidenceScore,
          processingMs,
          modelUsed: `whisper-1 + gemini-1.5-flash + ${speech.provider}`,
        });

        return reply.send({
          response_text: responseText,
          audio_base64: speech.audioBase64,
          intent,
          language: transcription.language,
          voice: speech.voice,
          transcribed_text: transcription.text,
          processing_ms: processingMs,
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Voice processing failed';
        app.log.error({ error }, 'Voice demo audio upload error');

        await logVoiceCommand({
          elderlyProfileId,
          commandText: undefined,
          detectedIntent: 'error',
          language: 'hi',
          wasSuccessful: false,
          confidenceScore: 0,
          processingMs: Date.now() - startTime,
          modelUsed: 'whisper-1 + gemini-1.5-flash + tts',
        }).catch(() => undefined);

        return reply.status(message.includes('OPENAI_API_KEY') ? 503 : 502).send({
          statusCode: message.includes('OPENAI_API_KEY') ? 503 : 502,
          error: 'AI Service Error',
          message: 'The voice service is temporarily unavailable. Please try again.',
          fallback_response: 'मैं अभी उपलब्ध नहीं हूँ। कृपया थोड़ी देर बाद कोशिश करें।',
          processing_ms: Date.now() - startTime,
        });
      }
    }

    const parsed = textRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: parsed.error.issues.map((issue) => issue.message).join(', '),
        details: parsed.error.issues,
      });
    }

    const { text, language, elderlyProfileId } = parsed.data;
    const intent = detectIntent(text);

    try {
      const responseText = await generateResponseText(text, language);
      const processingMs = Date.now() - startTime;

      await logVoiceCommand({
        elderlyProfileId,
        commandText: text,
        detectedIntent: intent,
        language,
        wasSuccessful: true,
        confidenceScore: 1,
        processingMs,
        modelUsed: 'gemini-1.5-flash',
      });

      return reply.send({
        response_text: responseText,
        audio_base64: null,
        intent,
        language,
        voice: VOICE_MAP[language],
        processing_ms: processingMs,
      });
    } catch (error: unknown) {
      app.log.error({ error, text, language }, 'Voice demo text error');

      await logVoiceCommand({
        elderlyProfileId,
        commandText: text,
        detectedIntent: intent,
        language,
        wasSuccessful: false,
        confidenceScore: 0,
        processingMs: Date.now() - startTime,
        modelUsed: 'gemini-1.5-flash',
      }).catch(() => undefined);

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
