/**
 * Twilio WhatsApp webhook — uses same DoctorFlow logic as Meta webhook.
 */
const { FieldValue } = require('firebase-admin/firestore');
const flow = require('./whatsappFlow');
const twilio = require('./twilioAdapter');

function createTwilioProcessor(db, secrets) {
  async function sendText(to, text) {
    await twilio.sendTwilioMessage({
      accountSid: secrets.accountSid(),
      authToken: secrets.authToken(),
      from: secrets.whatsappFrom(),
      to,
      text,
    });
  }

  async function isDuplicate(messageId) {
    if (!messageId) return false;
    const snap = await db.collection('processedWebhooks').doc(`twilio_${messageId}`).get();
    return snap.exists;
  }

  async function markProcessed(messageId) {
    if (!messageId) return;
    await db.collection('processedWebhooks').doc(`twilio_${messageId}`).set({
      processedAt: FieldValue.serverTimestamp(),
      provider: 'twilio',
    });
  }

  async function logDebug(entry) {
    await db.collection('webhookDebugLog').add({
      ...entry,
      provider: 'twilio',
      at: FieldValue.serverTimestamp(),
    });
  }

  return async function processTwilioBody(body) {
    const from = twilio.parseTwilioPhone(body.From);
    const rawBody = body.Body || '';
    const messageSid = body.MessageSid;

    await logDebug({
      source: 'twilio',
      hasMessage: Boolean(rawBody),
      from,
      messageId: messageSid,
      body: rawBody.slice(0, 120),
    });

    if (!from || !rawBody) return;

    if (await isDuplicate(messageSid)) return;

    const clinicSnap = await db.collection('clinics').doc('clinic-01').get();
    if (!clinicSnap.exists) {
      console.warn('Twilio: clinic-01 not found in Firestore');
      return;
    }

    const clinic = { id: clinicSnap.id, ...clinicSnap.data() };
    const message = twilio.buildFlowMessage(body.From, rawBody, messageSid);
    const text = rawBody.trim().toLowerCase();
    const phoneNumberId = 'twilio';

    console.log(`Twilio message from ${from}: "${text}" sid=${messageSid}`);

    const sessionRef = db.collection('patientSessions').doc(`${clinic.id}_${from}`);
    const sessionSnap = await sessionRef.get();
    const session = sessionSnap.exists ? sessionSnap.data() : { state: 'idle', context: {} };
    const send = {
      text: async (_pnid, to, msgText) => sendText(to, msgText),
    };

    try {
      if (text === 'ping') {
        const now = new Date().toLocaleTimeString('en-IN', {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
          timeZone: 'Asia/Kolkata',
        });
        await sendText(from, `🏓 Pong via Twilio! Server time: ${now} IST`);
        await markProcessed(messageSid);
        return;
      }

      const handled = await flow.handleDoctorFlowMessage({
        db,
        clinic,
        from,
        message,
        phoneNumberId,
        sessionRef,
        session,
        send,
      });

      if (!handled) {
        const patientName = await flow.getReturningPatientName(db, clinic.id, `+${from}`);
        await flow.showMainMenu(clinic, from, phoneNumberId, sessionRef, patientName, send);
      }

      await markProcessed(messageSid);
    } catch (err) {
      console.error('Twilio process failed:', err.message || err);
      try {
        await sendText(from, 'Sorry, something went wrong. Reply *MENU* to start again.');
      } catch (sendErr) {
        console.error('Twilio error reply failed:', sendErr.message);
      }
    }
  };
}

module.exports = { createTwilioProcessor };
