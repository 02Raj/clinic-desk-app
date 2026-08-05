/**
 * End-to-end flow debugger: Phone → Meta → Server → WhatsApp
 *
 * Usage:
 *   node functions/debugFullFlow.js
 *   node functions/debugFullFlow.js --token YOUR_META_TOKEN
 */

const https = require('https');

const PROJECT = 'clinic-desk-os';
const REGION = 'us-central1';
const PHONE_NUMBER_ID = '1280204118498625';
const WABA_ID = '1418691730318317';
const PATIENT_PHONE = '917236998742';
const VERIFY_TOKEN = 'clinic_desk_secure_webhook';

const WEBHOOK_URLS = [
  `https://${REGION}-${PROJECT}.cloudfunctions.net/whatsappWebhook`,
  `https://whatsappwebhook-xe5ogy5qqa-uc.a.run.app`,
];

const WHATSAPP_API = 'https://graph.facebook.com/v21.0';

function httpRequest(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      },
    );
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function makeHiPayload(messageId) {
  return JSON.stringify({
    object: 'whatsapp_business_account',
    entry: [{
      id: WABA_ID,
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: { phone_number_id: PHONE_NUMBER_ID },
          messages: [{
            from: PATIENT_PHONE,
            id: messageId || `debug-${Date.now()}`,
            timestamp: String(Math.floor(Date.now() / 1000)),
            text: { body: 'Hi' },
            type: 'text',
          }],
        },
        field: 'messages',
      }],
    }],
  });
}

async function checkWebhookVerify(baseUrl) {
  const url = `${baseUrl}?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=DEBUG_CHALLENGE_123`;
  const res = await httpRequest(url);
  const ok = res.status === 200 && res.body.includes('DEBUG_CHALLENGE_123');
  return { step: 'GET verify (Meta handshake)', url: baseUrl, status: res.status, ok, body: res.body.slice(0, 80) };
}

async function checkWebhookPost(baseUrl) {
  const payload = makeHiPayload(`debug-hi-${Date.now()}`);
  const res = await httpRequest(
    baseUrl,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    },
    payload,
  );
  return {
    step: 'POST Hi (simulates Meta → Server)',
    url: baseUrl,
    status: res.status,
    ok: res.status === 200,
    body: res.body.slice(0, 80),
    note: 'If 200, server processed. Check phone for Welcome menu within 30s.',
  };
}

async function checkWhatsAppSend(token) {
  if (!token) {
    return { step: 'POST WhatsApp API (Server → Phone)', ok: false, skipped: true, note: 'Pass --token or set WHATSAPP_ACCESS_SECRET' };
  }
  const res = await fetch(`${WHATSAPP_API}/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: PATIENT_PHONE,
      type: 'text',
      text: { body: `🔧 Flow debug ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} — Server → Phone works!` },
    }),
  });
  const body = await res.text();
  return {
    step: 'POST WhatsApp API (Server → Phone)',
    status: res.status,
    ok: res.ok,
    body: body.slice(0, 200),
  };
}

async function checkMetaWebhookSubscription(token) {
  if (!token) {
    return { step: 'Meta webhook subscription', ok: null, skipped: true };
  }
  try {
    const res = await fetch(`${WHATSAPP_API}/${WABA_ID}/subscribed_apps`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.text();
    return {
      step: 'Meta WABA subscribed_apps',
      status: res.status,
      ok: res.ok,
      body: body.slice(0, 300),
    };
  } catch (e) {
    return { step: 'Meta WABA subscribed_apps', ok: false, error: e.message };
  }
}

async function checkDebugLog() {
  const url = `https://${REGION}-${PROJECT}.cloudfunctions.net/getWebhookDebug`;
  const res = await httpRequest(url);
  return {
    step: 'Recent webhook events (did Meta reach server?)',
    url,
    status: res.status,
    ok: res.status === 200,
    body: res.body.slice(0, 500),
  };
}

function printResult(r) {
  const icon = r.ok === true ? '✅' : r.ok === false ? '❌' : '⏭️';
  console.log(`\n${icon} ${r.step}`);
  if (r.url) console.log(`   URL: ${r.url}`);
  if (r.status) console.log(`   HTTP: ${r.status}`);
  if (r.body) console.log(`   Body: ${r.body}`);
  if (r.note) console.log(`   Note: ${r.note}`);
  if (r.error) console.log(`   Error: ${r.error}`);
}

async function main() {
  const tokenArg = process.argv.find((a) => a.startsWith('--token='));
  const token = (tokenArg ? tokenArg.split('=')[1] : process.env.WHATSAPP_ACCESS_SECRET || '').trim();

  console.log('=== DoctorFlow WhatsApp Pipeline Debug ===\n');
  console.log('Flow: Phone → Meta → Server (webhook) → WhatsApp API → Phone\n');

  for (const url of WEBHOOK_URLS) {
    printResult(await checkWebhookVerify(url));
    printResult(await checkWebhookPost(url));
  }

  printResult(await checkWhatsAppSend(token));
  printResult(await checkMetaWebhookSubscription(token));
  printResult(await checkDebugLog());

  console.log('\n=== META DASHBOARD CHECKLIST ===');
  console.log('1. developers.facebook.com → Your App → WhatsApp → Configuration');
  console.log(`2. Callback URL must be: https://${REGION}-${PROJECT}.cloudfunctions.net/whatsappWebhook`);
  console.log(`3. Verify token must be: ${VERIFY_TOKEN}`);
  console.log('4. Subscribe to field: messages ✅');
  console.log(`5. Test recipient must include: +${PATIENT_PHONE}`);
  console.log('\n=== IF MANUAL TEST WORKS BUT PHONE DOES NOT ===');
  console.log('- Meta sandbox sometimes delays webhooks 1-10 minutes');
  console.log('- Send fresh message (not old chat), wait 2 min');
  console.log('- Check getWebhookDebug URL after sending Hi from phone');
  console.log('- If debug log empty → Meta is NOT calling your server (dashboard config issue)');
  console.log('- If debug log has entry but no WhatsApp reply → token/Firestore issue');
}

main().catch((e) => {
  console.error('Debug failed:', e);
  process.exit(1);
});
