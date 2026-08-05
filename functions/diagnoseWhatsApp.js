/**
 * Direct WhatsApp API test — bypasses webhook/Firestore.
 *
 * Usage (PowerShell):
 *   $env:WHATSAPP_ACCESS_SECRET="your-meta-token-here"
 *   node functions/diagnoseWhatsApp.js
 */

const PHONE_NUMBER_ID = '1280204118498625';
const TO = '917236998742';
const WHATSAPP_API = 'https://graph.facebook.com/v21.0';

async function main() {
  const token = (process.env.WHATSAPP_ACCESS_SECRET || '').trim();
  if (!token) {
    console.error('ERROR: Set WHATSAPP_ACCESS_SECRET env var to your Meta access token.');
    console.error('Example: $env:WHATSAPP_ACCESS_SECRET="EAAxx..."; node functions/diagnoseWhatsApp.js');
    process.exit(1);
  }

  console.log('Token length:', token.length);
  console.log('Phone number ID:', PHONE_NUMBER_ID);
  console.log('Sending test message to:', TO);

  const response = await fetch(`${WHATSAPP_API}/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: TO,
      type: 'text',
      text: { body: 'Clinic Desk test — if you see this, WhatsApp API is working!' },
    }),
  });

  const body = await response.text();
  console.log('HTTP status:', response.status);
  console.log('Response:', body);

  if (!response.ok) {
    console.error('\n--- COMMON FIXES ---');
    if (body.includes('131030') || body.includes('not in allowed')) {
      console.error('Your number is NOT on the Meta test recipient list.');
      console.error('Go to: Meta Developer Dashboard → WhatsApp → API Setup → Add recipient +917236998742');
    }
    if (body.includes('190') || body.includes('expired') || body.includes('invalid')) {
      console.error('Access token is invalid or expired. Generate a new token in Meta Dashboard.');
    }
    process.exit(1);
  }

  console.log('\nSUCCESS — check your phone for the test message.');
}

main().catch((err) => {
  console.error('Request failed:', err);
  process.exit(1);
});
