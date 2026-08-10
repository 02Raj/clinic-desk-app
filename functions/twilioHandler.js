/**
 * Twilio WhatsApp webhook — DoctorFlow + clickable menus + Sarvam AI.
 */
const { FieldValue } = require('firebase-admin/firestore');
const flow = require('./whatsappFlow');
const twilio = require('./twilioAdapter');
const interactive = require('./twilioInteractive');
const sarvam = require('./sarvamAdapter');
const patientCommands = require('./patientCommands');

function createTwilioProcessor(db, secrets) {
  const creds = () => ({
    accountSid: secrets.accountSid(),
    authToken: secrets.authToken(),
    from: secrets.whatsappFrom(),
  });

  async function sendText(to, text) {
    const { accountSid, authToken, from } = creds();
    await twilio.sendTwilioMessage({ accountSid, authToken, from, to, text });
  }

  async function sendList(_pnid, to, payload) {
    const { accountSid, authToken, from } = creds();
    try {
      await interactive.sendListPicker({ accountSid, authToken, from, to, ...payload });
    } catch (err) {
      console.error('Interactive list failed, falling back to text:', err.message);
      const lines = payload.items.map((item, i) => `${i + 1}. ${item.item}`).join('\n');
      await sendText(to, `${payload.body}\n\n${lines}\n\nReply with the number.`);
    }
  }

  async function sendButtons(_pnid, to, payload) {
    const { accountSid, authToken, from } = creds();
    try {
      await interactive.sendQuickReply({ accountSid, authToken, from, to, ...payload });
    } catch (err) {
      console.error('Interactive buttons failed, falling back to text:', err.message);
      const lines = payload.actions.map((action, i) => `${i + 1}. ${action.title}`).join('\n');
      await sendText(to, `${payload.body}\n\n${lines}\n\nReply with the number.`);
    }
  }

  function buildAiHelpers() {
    const apiKey = secrets.sarvamApiKey?.() || '';
    if (!apiKey) return {};

    return {
      aiIntent: (message, state) => sarvam.parsePatientIntent(apiKey, message, state),
      aiDetails: (message, knownName) => sarvam.parsePatientDetails(apiKey, message, knownName),
    };
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
    const buttonPayload = body.ButtonPayload || '';
    const rawBody = buttonPayload || body.Body || '';
    const messageSid = body.MessageSid;

    await logDebug({
      source: 'twilio',
      hasMessage: Boolean(rawBody),
      from,
      messageId: messageSid,
      body: rawBody.slice(0, 120),
      buttonPayload: buttonPayload || null,
    });

    if (!from || !rawBody) return;

    if (await isDuplicate(messageSid)) return;

    const clinicSnap = await db.collection('clinics').doc('clinic-01').get();
    if (!clinicSnap.exists) {
      console.warn('Twilio: clinic-01 not found in Firestore');
      return;
    }

    const clinic = { id: clinicSnap.id, ...clinicSnap.data() };
    const message = twilio.buildFlowMessage(body.From, body.Body || '', messageSid, buttonPayload);
    const text = rawBody.trim().toLowerCase();
    const phoneNumberId = 'twilio';

    console.log(`Twilio message from ${from}: "${text}" sid=${messageSid}`);

    const sessionRef = db.collection('patientSessions').doc(`${clinic.id}_${from}`);
    const sessionSnap = await sessionRef.get();
    const session = sessionSnap.exists ? sessionSnap.data() : { state: 'idle', context: {} };
    const send = {
      text: async (_pnid, to, msgText) => sendText(to, msgText),
      list: sendList,
      buttons: sendButtons,
      ...buildAiHelpers(),
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

      if (patientCommands.isGlobalPatientCommand(text)) {
        await patientCommands.handleGlobalPatientCommand(
          db, clinic, from, phoneNumberId, sessionRef, send, text,
        );
        await markProcessed(messageSid);
        return;
      }

      let handled = await flow.handleDoctorFlowMessage({
        db,
        clinic,
        from,
        message,
        phoneNumberId,
        sessionRef,
        session,
        send,
      });

      if (!handled && send.aiIntent) {
        const ai = await send.aiIntent(body.Body || rawBody, session.state || 'idle');
        const mapped = ai ? sarvam.mapAiActionToChoice(ai.action, ai.value) : null;
        if (mapped) {
          const aiMessage = twilio.buildFlowMessage(body.From, mapped, messageSid, mapped);
          handled = await flow.handleDoctorFlowMessage({
            db,
            clinic,
            from,
            message: aiMessage,
            phoneNumberId,
            sessionRef,
            session,
            send,
          });
        } else if (ai?.action === 'faq') {
          const hours = clinic.workingHours || { start: '09:00', end: '21:00' };
          await sendText(
            from,
            `📍 *${clinic.name || 'Clinic'}*\n🕐 Hours: ${hours.start} – ${hours.end}\n📞 Contact reception for fees and directions.`,
          );
          handled = true;
        }
      }

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
