import twilio from 'twilio';

export function buildSosSmsMessage(params: {
  elderName: string;
  triggerType: string;
  severity: string;
  lat?: number | null;
  lng?: number | null;
}) {
  const { elderName, triggerType, severity, lat, lng } = params;
  const locationUrl =
    lat != null && lng != null
      ? `https://maps.google.com/?q=${lat},${lng}`
      : 'Location unavailable';

  return `SAHAYAK EMERGENCY: ${elderName} needs help. Trigger: ${triggerType}. Severity: ${severity}. Location: ${locationUrl}`;
}

export async function sendBulkSms(phones: string[], body: string): Promise<number> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_PHONE_NUMBER;
  const uniquePhones = [...new Set(phones.filter(Boolean))];

  if (!accountSid || !authToken || !fromPhone || uniquePhones.length == 0) {
    return 0;
  }

  const client = twilio(accountSid, authToken);

  const results = await Promise.allSettled(
    uniquePhones.map((to) =>
      client.messages.create({
        to,
        from: fromPhone,
        body,
      }),
    ),
  );

  return results.filter((result) => result.status === 'fulfilled').length;
}
