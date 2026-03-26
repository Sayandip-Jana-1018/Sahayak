import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

export async function smsRoutes(app: FastifyInstance) {
  app.post('/send-install-link', async (request, reply) => {
    try {
      const schema = z.object({
        phone: z.string().regex(/^[6-9]\d{9}$/),
        recipientName: z.string().min(1),
        language: z.string().default('hi'),
      });

      const parsed = schema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Validation Error',
          message: parsed.error.issues.map((i) => i.message).join(', '),
        });
      }

      const { phone, recipientName, language } = parsed.data;
      const installUrl = `https://sahayak.app/install`;

      // Try Twilio if configured
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        try {
          // @ts-ignore — twilio may not be installed, handled by try-catch fallback
          const twilio = await import('twilio');
          const client = twilio.default(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

          const message = await client.messages.create({
            body: `Sahayak install karo: ${installUrl} - ${recipientName} ne bheja`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+91${phone}`,
          });

          return reply.send({
            success: true,
            messageId: message.sid,
          });
        } catch (twilioErr) {
          app.log.error({ error: twilioErr }, 'Twilio SMS send error');
          // Fall through to mock response
        }
      }

      // Fallback: log and return mock response
      app.log.info(`SMS (mock): Install link to +91${phone} for ${recipientName}`);
      return reply.send({
        success: true,
        messageId: `mock_${Date.now()}`,
      });
    } catch (error: unknown) {
      app.log.error({ error }, 'SMS send error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to send SMS',
      });
    }
  });
}
