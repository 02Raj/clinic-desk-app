/**
 * Twilio WhatsApp adapter — simpler than Meta direct API for development.
 * Docs: https://www.twilio.com/docs/whatsapp/sandbox
 */

const TWILIO_API = 'https://api.twilio.com/2010-04-01';

function parseTwilioPhone(waAddress) {
  if (!waAddress) return '';
  return waAddress.replace('whatsapp:', '').replace('+', '');
}

function buildFlowMessage(from, body, messageSid, buttonPayload) {
  const selection = buttonPayload || body || '';
  if (buttonPayload) {
    return {
      type: 'interactive',
      from: parseTwilioPhone(from),
      id: messageSid || `twilio-${Date.now()}`,
      interactive: {
        type: 'button_reply',
        button_reply: { id: buttonPayload, title: body || buttonPayload },
      },
      text: { body: selection },
    };
  }
  return {
    type: 'text',
    from: parseTwilioPhone(from),
    id: messageSid || `twilio-${Date.now()}`,
    text: { body: body || '' },
  };
}

async function sendTwilioMessage({ accountSid, authToken, from, to, text }) {
  const sid = String(accountSid || '').trim();
  const token = String(authToken || '').trim();
  const fromNumber = String(from || '').trim();
  const toAddress = to.startsWith('whatsapp:') ? to : `whatsapp:+${to.replace(/^\+/, '')}`;
  const fromAddress = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;

  const params = new URLSearchParams({
    From: fromAddress,
    To: toAddress,
    Body: text,
  });

  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const response = await fetch(`${TWILIO_API}/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const responseBody = await response.text();
  if (!response.ok) {
    console.error(`Twilio API error (${response.status}):`, responseBody);
    throw new Error(`Twilio API error: ${responseBody}`);
  }

  const result = JSON.parse(responseBody);
  console.log(`Twilio sent to ${toAddress}, sid=${result.sid}`);
  return result;
}

module.exports = {
  parseTwilioPhone,
  buildFlowMessage,
  sendTwilioMessage,
};
