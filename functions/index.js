const { onRequest } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineSecret, defineString } = require('firebase-functions/params');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const flow = require('./whatsappFlow');
const { createTwilioProcessor } = require('./twilioHandler');

initializeApp();
const db = getFirestore();

const WHATSAPP_API = 'https://graph.facebook.com/v21.0';
const whatsappAccessSecret = defineSecret('WHATSAPP_ACCESS_SECRET');
const whatsappVerifySecret = defineSecret('WHATSAPP_VERIFY_SECRET');
const whatsappSecrets = [whatsappAccessSecret, whatsappVerifySecret];

const twilioAccountSid = defineSecret('TWILIO_ACCOUNT_SID');
const twilioAuthToken = defineSecret('TWILIO_AUTH_TOKEN');
const twilioWhatsappFrom = defineSecret('TWILIO_WHATSAPP_FROM');
const sarvamApiKey = defineString('SARVAM_API_KEY', { default: '' });
const twilioSecrets = [twilioAccountSid, twilioAuthToken, twilioWhatsappFrom];

// ---------------------------------------------------------------------------
// WhatsApp Cloud API helpers
// ---------------------------------------------------------------------------

async function sendWhatsAppMessage(phoneNumberId, to, text) {
  const token = whatsappAccessSecret.value();
  if (!token) {
    console.error('WHATSAPP_ACCESS_SECRET not set — message not sent');
    throw new Error('WHATSAPP_ACCESS_SECRET not configured');
  }

  const response = await fetch(`${WHATSAPP_API}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });

  const body = await response.text();
  if (!response.ok) {
    console.error(`WhatsApp API error (${response.status}):`, body);
    throw new Error(`WhatsApp API error: ${body}`);
  }
  const result = JSON.parse(body);
  const messageId = result?.messages?.[0]?.id;
  console.log(`WhatsApp sent to ${to}, messageId=${messageId || 'unknown'}`);
  return result;
}

function generateBookingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function getISTDate() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 5.5 * 3600000);
}

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function logWebhookDebug(entry) {
  try {
    await db.collection('webhookDebugLog').add({
      ...entry,
      at: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.warn('logWebhookDebug failed:', err.message);
  }
}

async function markMessageRead(phoneNumberId, messageId) {
  const token = whatsappAccessSecret.value();
  if (!token || !messageId) return;
  try {
    await fetch(`${WHATSAPP_API}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      }),
    });
  } catch (err) {
    console.warn('markMessageRead failed:', err.message);
  }
}

async function isDuplicateMessage(messageId) {
  if (!messageId) return false;
  const snap = await db.collection('processedWebhooks').doc(messageId).get();
  if (snap.exists) {
    console.log(`Duplicate webhook skipped: ${messageId}`);
    return true;
  }
  return false;
}

async function markMessageProcessed(messageId) {
  if (!messageId) return;
  await db.collection('processedWebhooks').doc(messageId).set({
    processedAt: FieldValue.serverTimestamp(),
  });
}

async function processIncomingMessage({ message, phoneNumberId }) {
  const from = message.from;
  const messageId = message.id;

  try {
    const input = flow.extractMessageInput(message);
    if (!input) return;

    const text = input.text.trim().toLowerCase();
  const receivedAt = message.timestamp
    ? new Date(Number(message.timestamp) * 1000).toISOString()
    : 'unknown';
  console.log(
    `Processing message id=${messageId} from ${from}: "${text}" (wa_timestamp=${receivedAt})`,
  );

  const [clinicDoc, dup] = await Promise.all([
    findClinicByPhoneNumberId(phoneNumberId),
    isDuplicateMessage(messageId),
  ]);

  if (dup) return;

  if (!clinicDoc) {
    console.warn(`No clinic found for phone_number_id=${phoneNumberId}`);
    return;
  }

  const clinic = { id: clinicDoc.id, ...clinicDoc.data() };
  console.log(`Clinic found: ${clinic.id}`);

  const sessionRef = db.collection('patientSessions').doc(`${clinic.id}_${from}`);
  const sessionSnap = await sessionRef.get();
  const session = sessionSnap.exists ? sessionSnap.data() : { state: 'idle', context: {} };
  const send = { text: sendWhatsAppMessage };

  // Instant debug reply — helps measure Meta → server → phone delay
  if (text === 'ping') {
    const now = new Date().toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
    await send.text(phoneNumberId, from, `🏓 Pong! Server received your message at ${now} IST.`);
    await markMessageProcessed(messageId);
    return;
  }

  if (['status', 'queue', 'position'].includes(text)) {
    await handleQueueStatus(clinic, from, phoneNumberId);
    await markMessageProcessed(messageId);
    return;
  }

  if (text === 'here') {
    await handleHereCheckIn(clinic, from, phoneNumberId, sessionRef);
    await markMessageProcessed(messageId);
    return;
  }

  if (session.state === 'reminder_response') {
    await handleReminderResponse(clinic, from, phoneNumberId, text, session, sessionRef);
    await markMessageProcessed(messageId);
    return;
  }

  if (session.state === 'waitlist_offer') {
    await handleWaitlistResponse(clinic, from, phoneNumberId, text, session, sessionRef);
    await markMessageProcessed(messageId);
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

  await markMessageProcessed(messageId);
  } catch (err) {
    console.error('processIncomingMessage failed:', err.message || err, err.stack);
    try {
      await sendWhatsAppMessage(
        phoneNumberId,
        from,
        'Sorry, something went wrong on our end. Please reply *MENU* to start again.',
      );
    } catch (sendErr) {
      console.error('Failed to send error reply:', sendErr.message);
    }
  }
}

async function findClinicByPhoneNumberId(phoneNumberId) {
  const id = String(phoneNumberId);
  let snap = await db
    .collection('clinics')
    .where('whatsappPhoneNumberId', '==', id)
    .limit(1)
    .get();

  if (!snap.empty) return snap.docs[0];

  const asNum = Number(id);
  if (!Number.isNaN(asNum)) {
    snap = await db
      .collection('clinics')
      .where('whatsappPhoneNumberId', '==', asNum)
      .limit(1)
      .get();
    if (!snap.empty) return snap.docs[0];
  }

  return null;
}

// ---------------------------------------------------------------------------
// Twilio WhatsApp webhook (recommended for dev — easier than Meta direct)
// ---------------------------------------------------------------------------

exports.twilioWebhook = onRequest(
  { cors: true, secrets: twilioSecrets },
  async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method not allowed');
    }

    try {
      console.log('Twilio webhook POST received');
      let body = req.body || {};
      if (!body.From && req.rawBody) {
        const params = new URLSearchParams(req.rawBody.toString());
        body = Object.fromEntries(params.entries());
      }

      const processTwilio = createTwilioProcessor(db, {
        accountSid: () => String(twilioAccountSid.value() || '').trim(),
        authToken: () => String(twilioAuthToken.value() || '').trim(),
        whatsappFrom: () => String(twilioWhatsappFrom.value() || '').trim(),
        sarvamApiKey: () => String(sarvamApiKey.value() || '').trim(),
      });
      await processTwilio(body);
      res.status(200).send('<Response></Response>');
    } catch (err) {
      console.error('twilioWebhook error:', err.message || err);
      res.status(200).send('<Response></Response>');
    }
  },
);

// ---------------------------------------------------------------------------
// FR-1/2/3: WhatsApp webhook — booking bot + queue status (FR-20)
// ---------------------------------------------------------------------------

exports.whatsappWebhook = onRequest(
  { cors: true, secrets: whatsappSecrets },
  async (req, res) => {
    if (req.method === 'GET') {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];
      if (mode === 'subscribe' && token === whatsappVerifySecret.value()) {
        return res.status(200).send(challenge);
      }
      return res.status(403).send('Forbidden');
    }

    if (req.method !== 'POST') {
      return res.status(405).send('Method not allowed');
    }

    try {
      console.log(`Webhook POST received at ${new Date().toISOString()}`);

      const entry = req.body?.entry?.[0];
      const change = entry?.changes?.[0];
      const message = change?.value?.messages?.[0];
      const phoneNumberId = change?.value?.metadata?.phone_number_id;

      await logWebhookDebug({
        source: 'meta',
        hasMessage: Boolean(message),
        messageType: message?.type || null,
        from: message?.from || null,
        messageId: message?.id || null,
        body: message?.text?.body?.slice(0, 120) || null,
        phoneNumberId: phoneNumberId || null,
        field: change?.field || null,
      });

      if (!message) {
        console.log('Webhook POST: no message payload (status/delivery update) — skipping');
        return res.status(200).send('OK');
      }

      if (message.type !== 'text' && message.type !== 'interactive') {
        console.log(`Webhook POST: unsupported message type=${message.type} — skipping`);
        return res.status(200).send('OK');
      }

      // Mark read immediately so user sees activity while we process
      await markMessageRead(phoneNumberId, message.id);

      await processIncomingMessage({ message, phoneNumberId });
      return res.status(200).send('OK');
    } catch (err) {
      console.error('whatsappWebhook error:', err.message || err);
      return res.status(200).send('OK');
    }
  },
);

async function showAvailableSlots(clinic, to, phoneNumberId, sessionRef) {
  const today = getISTDate();
  const slots = buildSlotsForDay(clinic, today);
  const hours = clinic.workingHours || { start: '09:00', end: '18:00' };
  console.log(
    `showAvailableSlots: ${slots.length} slots, hours=${hours.start}-${hours.end}, clinic=${clinic.id}`,
  );

  if (slots.length === 0) {
    const istNow = new Date().toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
    console.log('showAvailableSlots: no slots — sending closed message');
    await sendWhatsAppMessage(
      phoneNumberId,
      to,
      `No slots available right now (current time: ${istNow}).\n\nClinic hours: ${hours.start} – ${hours.end}.\nPlease try again during working hours or contact the clinic.`,
    );
    await sessionRef.set({ state: 'idle', context: {}, updatedAt: FieldValue.serverTimestamp() });
    return;
  }

  const lines = slots.map((s, i) => `${i + 1}. ${s.label}`).join('\n');
  const msg = `Available slots today:\n\n${lines}\n\nReply with the slot number to book.`;

  console.log(`showAvailableSlots: sending slot list to ${to}`);
  await sendWhatsAppMessage(phoneNumberId, to, msg);

  const slotData = slots.map((s) => ({ label: s.label, timeMs: s.time.getTime() }));
  await sessionRef.set({
    state: 'selecting_slot',
    context: { slots: slotData, dateKey: formatDateKey(today) },
    updatedAt: FieldValue.serverTimestamp(),
  });
}

async function handleSlotSelection(clinic, to, phoneNumberId, text, session, sessionRef) {
  const choice = parseInt(text, 10);
  const slots = session.context?.slots || [];

  if (Number.isNaN(choice) || choice < 1 || choice > slots.length) {
    await sendWhatsAppMessage(phoneNumberId, to, 'Invalid choice. Please reply with a slot number.');
    return;
  }

  const slot = slots[choice - 1];
  const slotTime = new Date(slot.timeMs);
  const bookingCode = generateBookingCode();
  const doctorId = clinic.doctorIds?.[0] || 'doc-01';

  const appointmentRef = db.collection('appointments').doc();
  await appointmentRef.set({
    clinicId: clinic.id,
    doctorId,
    patientPhone: `+${to}`,
    patientName: `Patient ${to.slice(-4)}`,
    scheduledTime: Timestamp.fromDate(slotTime),
    dateKey: session.context.dateKey,
    status: 'BOOKED',
    bookingCode,
    source: 'whatsapp',
    createdAt: FieldValue.serverTimestamp(),
  });

  await sessionRef.set({ state: 'idle', context: {}, updatedAt: FieldValue.serverTimestamp() });

  const timeStr = slotTime.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const msg = `✅ Booked!\nDate: Today\nTime: ${timeStr}\nBooking code: *${bookingCode}*\n\nShow this code at the front desk. Reply HERE when you arrive.`;
  await sendWhatsAppMessage(phoneNumberId, to, msg);
}

async function handleHereCheckIn(clinic, to, phoneNumberId, sessionRef) {
  const todayKey = formatDateKey(getISTDate());
  const patientPhone = `+${to}`;

  console.log(`HERE check-in: clinic=${clinic.id}, phone=${patientPhone}, todayKey=${todayKey}`);

  const aptDoc = await findTodaysAppointmentForCheckIn(clinic.id, patientPhone, todayKey);

  if (!aptDoc) {
    console.log('HERE check-in: no eligible appointment found');
    await sendWhatsAppMessage(
      phoneNumberId,
      to,
      "We couldn't find an appointment for you today. Please type 'Hi' to book one.",
    );
    return;
  }

  const existing = aptDoc.data();
  if (existing.status === 'CHECKED_IN' && existing.tokenNumber) {
    await sendWhatsAppMessage(
      phoneNumberId,
      to,
      `Already checked in! Your token number is #${existing.tokenNumber}.`,
    );
    return;
  }

  const counterRef = db.collection('clinics').doc(clinic.id).collection('queueCounters').doc(todayKey);
  const tokenNumber = await db.runTransaction(async (tx) => {
    const counterSnap = await tx.get(counterRef);
    const lastToken = counterSnap.exists ? counterSnap.data().lastToken || 0 : 0;
    const nextToken = lastToken + 1;
    tx.set(counterRef, { lastToken: nextToken }, { merge: true });
    tx.update(aptDoc.ref, {
      status: 'CHECKED_IN',
      tokenNumber: nextToken,
      checkedInAt: FieldValue.serverTimestamp(),
    });
    return nextToken;
  });

  await sessionRef.set({ state: 'idle', context: {}, updatedAt: FieldValue.serverTimestamp() });
  await sendWhatsAppMessage(
    phoneNumberId,
    to,
    `✅ Checked in! Your token number is #${tokenNumber}. Please wait in the reception area.`,
  );
}

async function findTodaysAppointmentForCheckIn(clinicId, patientPhone, todayKey) {
  const statuses = ['BOOKED', 'CONFIRMED', 'CHECKED_IN'];
  for (const status of statuses) {
    const snap = await db
      .collection('appointments')
      .where('clinicId', '==', clinicId)
      .where('patientPhone', '==', patientPhone)
      .where('dateKey', '==', todayKey)
      .where('status', '==', status)
      .limit(1)
      .get();
    if (!snap.empty) return snap.docs[0];
  }
  return null;
}

async function handleQueueStatus(clinic, to, phoneNumberId) {
  const todayKey = formatDateKey(getISTDate());
  const snap = await db
    .collection('appointments')
    .where('clinicId', '==', clinic.id)
    .where('patientPhone', '==', `+${to}`)
    .where('dateKey', '==', todayKey)
    .get();

  const activeStatuses = ['CHECKED_IN', 'IN_PROGRESS', 'BOOKED', 'CONFIRMED'];
  const aptDoc = snap.docs.find((d) => activeStatuses.includes(d.data().status));

  const currentSnap = await db
    .collection('appointments')
    .where('clinicId', '==', clinic.id)
    .where('dateKey', '==', todayKey)
    .where('status', '==', 'IN_PROGRESS')
    .limit(1)
    .get();

  const currentToken = currentSnap.empty ? 0 : currentSnap.docs[0].data().tokenNumber || 0;

  if (!aptDoc) {
    await sendWhatsAppMessage(phoneNumberId, to, 'No active appointment found for today.');
    return;
  }

  const apt = aptDoc.data();
  const myToken = apt.tokenNumber;
  let position = 0;
  let waitMins = 0;

  if (myToken && currentToken) {
    position = Math.max(0, myToken - currentToken);
    waitMins = position * (clinic.avgConsultationMinutes || 15);
  }

  const msg = `Now serving: Token #${currentToken || '—'}\nYour token: #${myToken || '—'}\nPatients ahead: ${position}\nEst. wait: ~${waitMins} min`;
  await sendWhatsAppMessage(phoneNumberId, to, msg);
}

// ---------------------------------------------------------------------------
// FR-4/5: Appointment reminders (~1 hour before)
// ---------------------------------------------------------------------------

exports.sendReminders = onSchedule(
  { schedule: 'every 15 minutes', secrets: whatsappSecrets },
  async () => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const windowStart = new Date(oneHourLater.getTime() - 7 * 60 * 1000);
    const windowEnd = new Date(oneHourLater.getTime() + 7 * 60 * 1000);

    const snap = await db
      .collection('appointments')
      .where('status', 'in', ['BOOKED', 'CONFIRMED'])
      .where('reminderSent', '==', false)
      .get();

    for (const docSnap of snap.docs) {
      const apt = docSnap.data();
      const scheduled = apt.scheduledTime.toDate();
      if (scheduled < windowStart || scheduled > windowEnd) continue;

      const clinicSnap = await db.collection('clinics').doc(apt.clinicId).get();
      if (!clinicSnap.exists) continue;
      const clinic = clinicSnap.data();
      const phoneNumberId = clinic.whatsappPhoneNumberId;
      if (!phoneNumberId) continue;

      const timeStr = scheduled.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      const msg = `Reminder: Your appointment is at ${timeStr} today.\nReply 1 to confirm, 2 to cancel.`;

      const to = apt.patientPhone.replace('+', '');
      await sendWhatsAppMessage(phoneNumberId, to, msg);
      await docSnap.ref.update({ reminderSent: true });

      await db.collection('patientSessions').doc(`${apt.clinicId}_${to}`).set({
        state: 'reminder_response',
        context: { appointmentId: docSnap.id },
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  },
);

async function handleReminderResponse(clinic, to, phoneNumberId, text, session, sessionRef) {
  const appointmentId = session.context?.appointmentId;
  if (!appointmentId) return;

  const aptRef = db.collection('appointments').doc(appointmentId);

  if (text === '1') {
    await aptRef.update({ status: 'CONFIRMED' });
    await sendWhatsAppMessage(phoneNumberId, to, 'Confirmed. See you soon!');
  } else if (text === '2') {
    await aptRef.update({ status: 'CANCELLED' });
    await sendWhatsAppMessage(phoneNumberId, to, 'Appointment cancelled.');
    await offerWaitlistSlot(clinic, appointmentId);
  }

  await sessionRef.set({ state: 'idle', context: {}, updatedAt: FieldValue.serverTimestamp() });
}

// ---------------------------------------------------------------------------
// FR-9/10: Waitlist auto-fill on cancellation
// ---------------------------------------------------------------------------

async function offerWaitlistSlot(clinic, cancelledAppointmentId) {
  const cancelledSnap = await db.collection('appointments').doc(cancelledAppointmentId).get();
  if (!cancelledSnap.exists) return;
  const cancelled = cancelledSnap.data();

  const waitlistSnap = await db
    .collection('waitlist')
    .where('clinicId', '==', clinic.id)
    .where('status', '==', 'WAITING')
    .orderBy('position')
    .limit(3)
    .get();

  if (waitlistSnap.empty) return;

  const batch = db.batch();
  const phoneNumberId = clinic.whatsappPhoneNumberId;
  const timeStr = cancelled.scheduledTime.toDate().toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  for (const wlDoc of waitlistSnap.docs) {
    const entry = wlDoc.data();
    batch.update(wlDoc.ref, { status: 'OFFERED', offeredSlotId: cancelledAppointmentId });

    const msg = `A slot opened at ${timeStr} today! Reply YES to claim it.`;
    await sendWhatsAppMessage(phoneNumberId, entry.patientPhone.replace('+', ''), msg);

    await db.collection('patientSessions').doc(`${clinic.id}_${entry.patientPhone.replace('+', '')}`).set({
      state: 'waitlist_offer',
      context: { waitlistId: wlDoc.id, slotTime: cancelled.scheduledTime, doctorId: cancelled.doctorId },
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
}

async function handleWaitlistResponse(clinic, to, phoneNumberId, text, session, sessionRef) {
  if (text !== 'yes') {
    await sessionRef.set({ state: 'idle', context: {}, updatedAt: FieldValue.serverTimestamp() });
    return;
  }

  const waitlistId = session.context?.waitlistId;
  const wlRef = db.collection('waitlist').doc(waitlistId);
  const wlSnap = await wlRef.get();
  if (!wlSnap.exists || wlSnap.data().status !== 'OFFERED') {
    await sendWhatsAppMessage(phoneNumberId, to, 'Sorry, this slot was already taken.');
    return;
  }

  const bookingCode = generateBookingCode();
  const aptRef = db.collection('appointments').doc();
  await aptRef.set({
    clinicId: clinic.id,
    doctorId: session.context.doctorId,
    patientPhone: `+${to}`,
    patientName: wlSnap.data().patientName,
    scheduledTime: session.context.slotTime,
    dateKey: formatDateKey(session.context.slotTime.toDate()),
    status: 'BOOKED',
    bookingCode,
    source: 'whatsapp',
    createdAt: FieldValue.serverTimestamp(),
  });

  await wlRef.update({ status: 'ACCEPTED' });
  await sessionRef.set({ state: 'idle', context: {}, updatedAt: FieldValue.serverTimestamp() });
  await sendWhatsAppMessage(phoneNumberId, to, `Slot booked! Code: *${bookingCode}*`);
}

// ---------------------------------------------------------------------------
// FR-21: Proactive "your turn is approaching" notifications
// ---------------------------------------------------------------------------

exports.notifyApproachingTurn = onSchedule(
  { schedule: 'every 5 minutes', secrets: whatsappSecrets },
  async () => {
    const todayKey = formatDateKey(getISTDate());
    const clinicsSnap = await db.collection('clinics').get();

    for (const clinicDoc of clinicsSnap.docs) {
      const clinic = { id: clinicDoc.id, ...clinicDoc.data() };
      const phoneNumberId = clinic.whatsappPhoneNumberId;
      if (!phoneNumberId) continue;

      const currentSnap = await db
        .collection('appointments')
        .where('clinicId', '==', clinic.id)
        .where('dateKey', '==', todayKey)
        .where('status', '==', 'IN_PROGRESS')
        .limit(1)
        .get();

      const currentToken = currentSnap.empty ? 0 : currentSnap.docs[0].data().tokenNumber || 0;
      const threshold = clinic.approachNotifyPatients || 4;

      const waitingSnap = await db
        .collection('appointments')
        .where('clinicId', '==', clinic.id)
        .where('dateKey', '==', todayKey)
        .where('status', '==', 'CHECKED_IN')
        .get();

      for (const docSnap of waitingSnap.docs) {
        const apt = docSnap.data();
        if (apt.approachNotified) continue;
        const ahead = apt.tokenNumber - currentToken;
        if (ahead > 0 && ahead <= threshold) {
          const to = apt.patientPhone.replace('+', '');
          const msg = `Your turn is approaching! You are #${apt.tokenNumber} — only ${ahead} patient(s) ahead.`;
          await sendWhatsAppMessage(phoneNumberId, to, msg);
          await docSnap.ref.update({ approachNotified: true });
        }
      }
    }
  },
);

// ---------------------------------------------------------------------------
// FR-11: Daily morning brief to doctor
// ---------------------------------------------------------------------------

exports.dailyBrief = onSchedule(
  { schedule: '0 7 * * *', secrets: whatsappSecrets },
  async () => {
    const todayKey = formatDateKey(getISTDate());
    const clinicsSnap = await db.collection('clinics').get();

    for (const clinicDoc of clinicsSnap.docs) {
      const clinic = { id: clinicDoc.id, ...clinicDoc.data() };
      if (!clinic.doctorWhatsApp || !clinic.whatsappPhoneNumberId) continue;

      const aptsSnap = await db
        .collection('appointments')
        .where('clinicId', '==', clinic.id)
        .where('dateKey', '==', todayKey)
        .where('status', 'in', ['BOOKED', 'CONFIRMED', 'CHECKED_IN'])
        .get();

      const first = aptsSnap.docs
        .map((d) => d.data())
        .sort((a, b) => a.scheduledTime.toMillis() - b.scheduledTime.toMillis())[0];

      const firstTime = first
        ? first.scheduledTime.toDate().toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })
        : 'No appointments';

      const msg = `Good morning, ${clinic.name}!\n\nPatients today: ${aptsSnap.size}\nFirst appointment: ${firstTime}\n\nHave a great clinic day.`;
      await sendWhatsAppMessage(clinic.whatsappPhoneNumberId, clinic.doctorWhatsApp.replace('+', ''), msg);
    }
  },
);

// ---------------------------------------------------------------------------
// FR-12: Monday weekly summary
// ---------------------------------------------------------------------------

exports.weeklySummary = onSchedule(
  { schedule: '0 8 * * 1', secrets: whatsappSecrets },
  async () => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 7);

    const clinicsSnap = await db.collection('clinics').get();

    for (const clinicDoc of clinicsSnap.docs) {
      const clinic = { id: clinicDoc.id, ...clinicDoc.data() };
      if (!clinic.doctorWhatsApp || !clinic.whatsappPhoneNumberId) continue;

      const snap = await db
        .collection('appointments')
        .where('clinicId', '==', clinic.id)
        .where('scheduledTime', '>=', Timestamp.fromDate(start))
        .where('scheduledTime', '<=', Timestamp.fromDate(end))
        .get();

      let completed = 0;
      let noShows = 0;
      let cancellations = 0;
      snap.docs.forEach((d) => {
        const s = d.data().status;
        if (s === 'COMPLETED') completed += 1;
        if (s === 'NO_SHOW') noShows += 1;
        if (s === 'CANCELLED') cancellations += 1;
      });

      const total = snap.size;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

      const msg = `Weekly summary for ${clinic.name}\n\nCompleted: ${completed}\nNo-shows: ${noShows}\nCancellations: ${cancellations}\nCompletion rate: ${rate}%`;
      await sendWhatsAppMessage(clinic.whatsappPhoneNumberId, clinic.doctorWhatsApp.replace('+', ''), msg);
    }
  },
);

// ---------------------------------------------------------------------------
// Slot builder helpers
// ---------------------------------------------------------------------------

function istWallClockToUtcMs(y, month, day, hour, minute) {
  // IST wall clock → real UTC timestamp (IST = UTC + 5:30)
  return Date.UTC(y, month, day, hour, minute) - 5.5 * 3600000;
}

function buildSlotsForDay(clinic, istDate) {
  const [startH, startM] = (clinic.workingHours?.start || '09:00').split(':').map(Number);
  const [endH, endM] = (clinic.workingHours?.end || '18:00').split(':').map(Number);
  const duration = clinic.slotDurationMinutes || 30;

  const y = istDate.getFullYear();
  const month = istDate.getMonth();
  const day = istDate.getDate();
  const nowMs = Date.now();

  const slots = [];
  let cursorH = startH;
  let cursorM = startM;
  const endMinutes = endH * 60 + endM;

  while (cursorH * 60 + cursorM < endMinutes) {
    const slotMs = istWallClockToUtcMs(y, month, day, cursorH, cursorM);
    if (slotMs > nowMs) {
      const label = new Date(slotMs).toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      });
      slots.push({ time: new Date(slotMs), label });
    }
    cursorM += duration;
    while (cursorM >= 60) {
      cursorM -= 60;
      cursorH += 1;
    }
  }
  return slots.slice(0, 8);
}

exports.setAdminClaim = onRequest(async (req, res) => {
  const email = req.query.email || 'admin@clinic.com';
  const clinicId = req.query.clinicId || 'clinic-01';
  try {
    const { getAuth } = require('firebase-admin/auth');
    const user = await getAuth().getUserByEmail(email);
    await getAuth().setCustomUserClaims(user.uid, { clinicId });
    res.status(200).send(`Custom claim clinicId=${clinicId} set for ${email}`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// One-time helper: seed doctors for DoctorFlow booking
exports.seedDoctors = onRequest(async (req, res) => {
  const clinicId = req.query.clinicId || 'clinic-01';
  try {
    const batch = db.batch();
    for (const doc of flow.DEFAULT_DOCTORS) {
      const ref = db.collection('doctors').doc(doc.id);
      batch.set(ref, { ...doc, clinicId }, { merge: true });
    }
    await batch.commit();
    res.status(200).send(`Seeded ${flow.DEFAULT_DOCTORS.length} doctors for ${clinicId}`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Seed clinic document required for webhook to find clinic by phone_number_id
exports.seedClinic = onRequest(async (req, res) => {
  const clinicId = req.query.clinicId || 'clinic-01';
  try {
    await db.collection('clinics').doc(clinicId).set(
      {
        name: 'City Care Clinic',
        whatsappPhoneNumberId: '1280204118498625',
        doctorIds: ['doc-01', 'doc-02', 'doc-03'],
        workingHours: { start: '09:00', end: '21:00', days: [1, 2, 3, 4, 5, 6] },
        slotDurationMinutes: 30,
        avgConsultationMinutes: 15,
      },
      { merge: true },
    );
    res.status(200).send(`Clinic ${clinicId} seeded with whatsappPhoneNumberId=1280204118498625`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Full setup health check — open in browser
exports.metaSetupStatus = onRequest({ secrets: whatsappSecrets }, async (req, res) => {
  const verifyOk = whatsappVerifySecret.value() === 'clinic_desk_secure_webhook';
  const tokenPresent = Boolean(whatsappAccessSecret.value());
  let tokenWorks = false;
  let tokenError = null;

  if (tokenPresent) {
    try {
      const r = await fetch(`${WHATSAPP_API}/1280204118498625`, {
        headers: { Authorization: `Bearer ${whatsappAccessSecret.value()}` },
      });
      tokenWorks = r.ok;
      if (!r.ok) tokenError = (await r.text()).slice(0, 200);
    } catch (e) {
      tokenError = e.message;
    }
  }

  const clinicSnap = await db.collection('clinics').doc('clinic-01').get();
  const recentSnap = await db.collection('webhookDebugLog').orderBy('at', 'desc').limit(5).get();
  const recent = recentSnap.docs.map((d) => ({
    at: d.data().at?.toDate?.()?.toISOString(),
    from: d.data().from,
    body: d.data().body,
  }));

  res.status(200).json({
    status: verifyOk && tokenWorks && clinicSnap.exists ? 'READY' : 'NEEDS_FIX',
    checks: {
      verifyTokenMatchesMeta: verifyOk,
      accessTokenPresent: tokenPresent,
      accessTokenValid: tokenWorks,
      accessTokenError: tokenError,
      clinicInFirestore: clinicSnap.exists,
      clinicPhoneNumberId: clinicSnap.data()?.whatsappPhoneNumberId || null,
    },
    webhookUrl: 'https://us-central1-clinic-desk-os.cloudfunctions.net/whatsappWebhook',
    verifyToken: 'clinic_desk_secure_webhook',
    testRecipient: '+917236998742',
    recentWebhookEvents: recent,
    metaDashboardSteps: [
      '1. Generate Access Token (Basic setup → Generate token)',
      '2. Add +917236998742 as test recipient',
      '3. Configuration → Webhook → Verify and Save (green tick)',
      '4. Subscribe to field: messages (toggle ON)',
      '5. Send Hi from phone, then check recentWebhookEvents below',
    ],
  });
});

// Debug: test if Meta dashboard verify token matches Firebase secret
exports.testVerifyToken = onRequest({ secrets: [whatsappVerifySecret] }, (req, res) => {
  const token = (req.query.token || '').trim();
  res.status(200).json({
    matchesFirebaseSecret: token === whatsappVerifySecret.value(),
    hint: token
      ? 'If false → update Meta dashboard OR run: firebase functions:secrets:set WHATSAPP_VERIFY_SECRET'
      : 'Pass ?token=your_meta_verify_token',
  });
});

// Debug: see if Meta reached your server (open in browser after sending Hi from phone)
exports.getWebhookDebug = onRequest(async (req, res) => {
  try {
    const snap = await db
      .collection('webhookDebugLog')
      .orderBy('at', 'desc')
      .limit(15)
      .get();
    const events = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        at: data.at?.toDate?.()?.toISOString() || null,
        from: data.from,
        body: data.body,
        messageType: data.messageType,
        hasMessage: data.hasMessage,
        source: data.source,
      };
    });
    res.status(200).json({
      count: events.length,
      hint: 'If empty after sending Hi from phone → Meta is NOT calling your webhook URL.',
      events,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// One-time helper: extend clinic hours for evening testing
exports.extendClinicHours = onRequest(async (req, res) => {
  const clinicId = req.query.clinicId || 'clinic-01';
  const end = req.query.end || '21:00';
  try {
    await db.collection('clinics').doc(clinicId).set(
      {
        workingHours: { start: '09:00', end, days: [1, 2, 3, 4, 5, 6] },
      },
      { merge: true },
    );
    res.status(200).send(`Clinic ${clinicId} hours updated to 09:00 – ${end}`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

const { clinicSignup } = require('./clinicSignup');
exports.clinicSignup = clinicSignup;
