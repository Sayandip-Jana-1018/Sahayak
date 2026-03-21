import type { FastifyInstance } from 'fastify';

export async function prescriptionOcrRoutes(app: FastifyInstance) {
  app.post('/prescription-ocr', async (request, reply) => {
    try {
      const file = await request.file();
      if (!file) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'No image file provided. Please upload a prescription photo.',
        });
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.mimetype)) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Invalid File Type',
          message: `Unsupported file type: ${file.mimetype}. Allowed: JPG, PNG, WebP, PDF.`,
        });
      }

      const buffer = await file.toBuffer();

      // Google Cloud Vision OCR
      const extractedText = await performOCR(buffer, file.mimetype);

      // Gemini: parse prescription from text
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Extract medicine information from this prescription text.
Return ONLY valid JSON (no markdown, no code fences):
{
  "medicines": [{"name":"string","dosage":"string","frequency":"string","duration":"string","instructions":"string"}],
  "doctorName": "string or null",
  "patientName": "string or null",
  "date": "string or null",
  "hospitalName": "string or null"
}

Prescription text: """${extractedText}"""`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      let parsed;
      try {
        const cleaned = responseText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch {
        parsed = {
          medicines: [],
          doctorName: null,
          patientName: null,
          date: null,
          hospitalName: null,
        };
      }

      return reply.send({
        ...parsed,
        prescriptionUrl: null, // R2 upload URL would go here
        rawText: extractedText,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'OCR processing failed';
      app.log.error({ error }, 'Prescription OCR error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Processing Error',
        message: 'Failed to process the prescription image. Please try a clearer photo.',
      });
    }
  });
}

async function performOCR(buffer: Buffer, mimeType: string): Promise<string> {
  // In production: Google Cloud Vision API
  // For dev mode: use Gemini vision directly
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const imagePart = {
      inlineData: {
        data: buffer.toString('base64'),
        mimeType,
      },
    };

    const result = await model.generateContent([
      'Extract ALL text from this prescription/medical document image. Return only the raw text, preserving the layout as much as possible.',
      imagePart,
    ]);

    return result.response.text();
  } catch {
    return '';
  }
}
