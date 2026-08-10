/**
 * Twilio WhatsApp interactive messages (list picker + quick reply buttons).
 * Docs: https://www.twilio.com/docs/content/twiliolist-picker
 */

const CONTENT_API = 'https://content.twilio.com/v1/Content';
const TWILIO_API = 'https://api.twilio.com/2010-04-01';

function authHeader(accountSid, authToken) {
  return `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`;
}

function formatAddresses(from, to) {
  const toAddress = to.startsWith('whatsapp:') ? to : `whatsapp:+${to.replace(/^\+/, '')}`;
  const fromAddress = from.startsWith('whatsapp:') ? from : `whatsapp:${from}`;
  return { fromAddress, toAddress };
}

async function createContent(accountSid, authToken, payload) {
  const response = await fetch(CONTENT_API, {
    method: 'POST',
    headers: {
      Authorization: authHeader(accountSid, authToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Twilio Content API error (${response.status}): ${body}`);
  }
  return JSON.parse(body);
}

async function sendContentMessage({ accountSid, authToken, from, to, contentSid }) {
  const sid = String(accountSid || '').trim();
  const token = String(authToken || '').trim();
  const { fromAddress, toAddress } = formatAddresses(from, to);

  const params = new URLSearchParams({
    From: fromAddress,
    To: toAddress,
    ContentSid: contentSid,
  });

  const response = await fetch(`${TWILIO_API}/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(sid, token),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const responseBody = await response.text();
  if (!response.ok) {
    throw new Error(`Twilio send error (${response.status}): ${responseBody}`);
  }
  return JSON.parse(responseBody);
}

async function sendListPicker({ accountSid, authToken, from, to, body, button, items }) {
  const content = await createContent(accountSid, authToken, {
    friendly_name: `list_${Date.now()}`,
    language: 'en',
    types: {
      'twilio/list-picker': {
        body,
        button,
        items: items.slice(0, 10).map((item) => ({
          id: String(item.id).slice(0, 200),
          item: String(item.item).slice(0, 24),
          description: String(item.description || item.item).slice(0, 72),
        })),
      },
    },
  });

  const result = await sendContentMessage({
    accountSid,
    authToken,
    from,
    to,
    contentSid: content.sid,
  });
  console.log(`Twilio list sent to ${to}, sid=${result.sid}`);
  return result;
}

async function sendQuickReply({ accountSid, authToken, from, to, body, actions }) {
  const content = await createContent(accountSid, authToken, {
    friendly_name: `quick_${Date.now()}`,
    language: 'en',
    types: {
      'twilio/quick-reply': {
        body,
        actions: actions.slice(0, 3).map((action) => ({
          id: String(action.id).slice(0, 200),
          title: String(action.title).slice(0, 20),
        })),
      },
    },
  });

  const result = await sendContentMessage({
    accountSid,
    authToken,
    from,
    to,
    contentSid: content.sid,
  });
  console.log(`Twilio quick-reply sent to ${to}, sid=${result.sid}`);
  return result;
}

module.exports = {
  sendListPicker,
  sendQuickReply,
};
