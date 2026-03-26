import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const schemeSchema = z.object({
  age: z.number().min(18).max(120),
  state: z.string().min(1),
  income: z.string().optional(),
  gender: z.enum(['M', 'F']).optional(),
  category: z.string().optional(),
});

export async function schemeFinderRoutes(app: FastifyInstance) {
  app.post('/schemes', async (request, reply) => {
    const parsed = schemeSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: parsed.error.issues.map(i => i.message).join(', '),
      });
    }

    const { age, state, income, gender, category } = parsed.data;

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are an expert on Indian government welfare schemes for elderly citizens.
Find the top 5 most relevant government schemes for a person with these details:
- Age: ${age} years
- State: ${state}
- Income: ${income || 'Not specified'}
- Gender: ${gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : 'Not specified'}
- Category: ${category || 'General'}

Return ONLY valid JSON (no markdown):
{
  "schemes": [
    {
      "name": "Scheme name",
      "benefit": "What they get",
      "eligibility": "Who qualifies",
      "applyUrl": "URL or office to apply",
      "explanation_hi": "Simple Hindi explanation (2 sentences max)",
      "explanation_en": "Simple English explanation (2 sentences max)"
    }
  ]
}

Focus on: pension schemes, health insurance (Ayushman Bharat), widow pension, disability benefits, BPL schemes, and state-specific schemes for ${state}.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      let schemesData;
      try {
        const cleaned = responseText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        schemesData = JSON.parse(cleaned);
      } catch {
        schemesData = { schemes: [] };
      }

      return reply.send(schemesData);
    } catch (error: unknown) {
      app.log.error({ error }, 'Scheme finder error');
      return reply.status(502).send({
        statusCode: 502,
        error: 'AI Service Error',
        message: 'Unable to find schemes right now. Please try again.',
      });
    }
  });
}
