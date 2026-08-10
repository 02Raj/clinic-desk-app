/**
 * Sarvam AI — Hindi/Hinglish intent parsing for clinic WhatsApp bot.
 * Docs: https://docs.sarvam.ai/api-reference-docs/authentication
 */

const SARVAM_API = 'https://api.sarvam.ai/v1/chat/completions';

async function callSarvam(apiKey, messages, maxTokens = 250) {
  const key = String(apiKey || '').trim();
  if (!key) return null;

  const response = await fetch(SARVAM_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'sarvam-105b',
      messages,
      temperature: 0.1,
      max_tokens: maxTokens,
    }),
  });

  const raw = await response.text();
  if (!response.ok) {
    console.error(`Sarvam API error (${response.status}):`, raw.slice(0, 300));
    if (response.status === 403) {
      console.error('Sarvam key rejected. Use API key from https://dashboard.sarvam.ai (not Samvaad-only keys).');
    }
    return null;
  }

  const data = JSON.parse(raw);
  return data.choices?.[0]?.message?.content?.trim() || null;
}

function parseJsonFromText(text) {
  if (!text) return null;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

async function parsePatientIntent(apiKey, message, state) {
  const system = `You parse clinic WhatsApp patient messages. Return ONLY valid JSON:
{"action":"menu|book|view|cancel|info|doctor|date|slot|confirm|details|faq|unknown","value":"1|2|3|4 or id string or empty","details":{"name":"","age":"","gender":"","reason":""}}

Rules:
- Hindi, English, Hinglish supported
- action=book for appointment booking intent
- action=view for check appointment
- action=cancel for cancel appointment
- action=info for clinic hours/fees/location questions
- action=details when patient gives name/age/reason
- action=menu for hi/hello/menu
- value is menu number when obvious (1-4)
- current_state: ${state || 'idle'}
- Never diagnose medical conditions`;

  const content = await callSarvam(apiKey, [
    { role: 'system', content: system },
    { role: 'user', content: message },
  ]);

  return parseJsonFromText(content);
}

async function parsePatientDetails(apiKey, message, knownName) {
  const system = `Extract patient details from message. Return ONLY JSON:
{"name":"","age":"","gender":"Not specified","reason":""}
Use "${knownName || ''}" as name if missing. Age as string number. Reason required.`;

  const content = await callSarvam(apiKey, [
    { role: 'system', content: system },
    { role: 'user', content: message },
  ]);

  const parsed = parseJsonFromText(content);
  if (!parsed?.name && !parsed?.reason) return null;
  return {
    name: parsed.name || knownName || 'Patient',
    age: parsed.age || 'Not specified',
    gender: parsed.gender || 'Not specified',
    reason: parsed.reason || 'General consultation',
  };
}

function mapAiActionToChoice(action, value) {
  const map = {
    menu: 'menu',
    book: '1',
    view: '2',
    cancel: '3',
    info: '4',
    today: '1',
    tomorrow: '2',
    confirm: '1',
    edit: '2',
    yes: '1',
    no: '2',
  };
  if (value && /^[1-4]$/.test(String(value))) return String(value);
  if (action && map[action]) return map[action];
  if (action?.startsWith('doctor_')) return action.replace('doctor_', '');
  if (action?.startsWith('slot_')) return action.replace('slot_', '');
  return null;
}

module.exports = {
  parsePatientIntent,
  parsePatientDetails,
  mapAiActionToChoice,
};
