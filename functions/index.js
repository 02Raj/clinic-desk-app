const { onRequest } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore();

// ---------------------------------------------------------------------------
// WhatsApp Cloud API helpers
// ---------------------------------------------------------------------------

const WHATSAPP_API = 'https://graph.facebook.com/v21.0';

async function sendWhatsAppMessage(phoneNumberId, to, text) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) {
    console.warn('WHATSAPP_ACCESS_TOKEN not set — skipping send');
    return null;
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

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`WhatsApp API error: ${err}`);
  }
  return response.json();
}

function generateBookingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function bilingual(clinic, en, hi) {
  return clinic.defaultLanguage === 'hi' ? `${hi}\n\n${en}` : `${en}\n\n${hi}`;
}

// ---------------------------------------------------------------------------
// FR-1/2/3: WhatsApp webhook — booking bot + queue status (FR-20)
// ---------------------------------------------------------------------------

exports.whatsappWebhook = onRequest({ cors: true }, async (req, res) => {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];
    const phoneNumberId = change?.value?.metadata?.phone_number_id;

    if (!message || message.type !== 'text') {
      return res.status(200).send('OK');
    }

    const from = message.from;
    const text = message.text.body.trim().toLowerCase();
    const clinicSnap = await db
      .collection('clinics')
      .where('whatsappPhoneNumberId', '==', phoneNumberId)
      .limit(1)
      .get();

    if (clinicSnap.empty) {
      return res.status(200).send('OK');
    }

    const clinicDoc = clinicSnap.docs[0];
    const clinic = { id: clinicDoc.id, ...clinicDoc.data() };

    const sessionRef = db.collection('patientSessions').doc(`${clinic.id}_${from}`);
    const sessionSnap = await sessionRef.get();
    const session = sessionSnap.exists ? sessionSnap.data() : { state: 'idle', context: {} };

    // Queue status keyword (FR-20)
    if (['status', 'queue', 'position', 'स्थिति'].includes(text)) {
      await handleQueueStatus(clinic, from, phoneNumberId);
      return res.status(200).send('OK');
    }

    // Booking flow entry
    if (['hi', 'hello', 'book', 'appointment', 'नमस्ते', 'बुकिंग'].includes(text) || session.state === 'idle') {
      await showAvailableSlots(clinic, from, phoneNumberId, sessionRef);
      return res.status(200).send('OK');
    }

    if (session.state === 'selecting_slot') {
      await handleSlotSelection(clinic, from, phoneNumberId, text, session, sessionRef);
      return res.status(200).send('OK');
    }

    if (session.state === 'reminder_response') {
      await handleReminderResponse(clinic, from, phoneNumberId, text, session, sessionRef);
      return res.status(200).send('OK');
    }

    if (session.state === 'waitlist_offer') {
      await handleWaitlistResponse(clinic, from, phoneNumberId, text, session, sessionRef);
      return res.status(200).send('OK');
    }

    const help = bilingual(
      clinic,
      'Reply BOOK to see available slots, or STATUS to check your queue position.',
      'स्लॉट देखने के लिए BOOK लिखें, या कतार की स्थिति के लिए STATUS लिखें।',
    );
    await sendWhatsAppMessage(phoneNumberId, from, help);
    res.status(200).send('OK');
  } catch (err) {
    console.error('whatsappWebhook error:', err);
    res.status(500).send('Error');
  }
});

async function showAvailableSlots(clinic, to, phoneNumberId, sessionRef) {
  const today = new Date();
  const slots = buildSlotsForDay(clinic, today);
  const lines = slots.map((s, i) => `${i + 1}. ${s.label}`).join('\n');

  await sessionRef.set({
    state: 'selecting_slot',
    context: { slots, dateKey: formatDateKey(today) },
    updatedAt: FieldValue.serverTimestamp(),
  });

  const msg = bilingual(
    clinic,
    `Available slots today:\n\n${lines}\n\nReply with the slot number to book.`,
    `आज के उपलब्ध स्लॉट:\n\n${lines}\n\nबुक करने के लिए स्लॉट नंबर भेजें।`,
  );
  await sendWhatsAppMessage(phoneNumberId, to, msg);
}

async function handleSlotSelection(clinic, to, phoneNumberId, text, session, sessionRef) {
  const choice = parseInt(text, 10);
  const slots = session.context?.slots || [];

  if (Number.isNaN(choice) || choice < 1 || choice > slots.length) {
    await sendWhatsAppMessage(
      phoneNumberId,
      to,
      bilingual(clinic, 'Invalid choice. Please reply with a slot number.', 'गलत विकल्प। कृपया स्लॉट नंबर भेजें।'),
    );
    return;
  }

  const slot = slots[choice - 1];
  const bookingCode = generateBookingCode();
  const doctorId = clinic.doctorIds?.[0] || 'doc-01';

  const appointmentRef = db.collection('appointments').doc();
  await appointmentRef.set({
    clinicId: clinic.id,
    doctorId,
    patientPhone: `+${to}`,
    patientName: `Patient ${to.slice(-4)}`,
    scheduledTime: Timestamp.fromDate(slot.time),
    dateKey: session.context.dateKey,
    status: 'BOOKED',
    bookingCode,
    source: 'whatsapp',
    createdAt: FieldValue.serverTimestamp(),
  });

  await sessionRef.set({ state: 'idle', context: {}, updatedAt: FieldValue.serverTimestamp() });

  const timeStr = slot.time.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  const msg = bilingual(
    clinic,
    `✅ Booked!\nDate: Today\nTime: ${timeStr}\nBooking code: *${bookingCode}*\n\nShow this code at the front desk.`,
    `✅ बुक हो गया!\nसमय: ${timeStr}\nबुकिंग कोड: *${bookingCode}*\n\nफ्रंट डेस्क पर यह कोड दिखाएं।`,
  );
  await sendWhatsAppMessage(phoneNumberId, to, msg);
}

async function handleQueueStatus(clinic, to, phoneNumberId) {
  const todayKey = formatDateKey(new Date());
  const aptSnap = await db
    .collection('appointments')
    .where('clinicId', '==', clinic.id)
    .where('patientPhone', '==', `+${to}`)
    .where('dateKey', '==', todayKey)
    .where('status', 'in', ['CHECKED_IN', 'IN_PROGRESS', 'BOOKED', 'CONFIRMED'])
    .limit(1)
    .get();

  const currentSnap = await db
    .collection('appointments')
    .where('clinicId', '==', clinic.id)
    .where('dateKey', '==', todayKey)
    .where('status', '==', 'IN_PROGRESS')
    .limit(1)
    .get();

  const currentToken = currentSnap.empty ? 0 : currentSnap.docs[0].data().tokenNumber || 0;

  if (aptSnap.empty) {
    await sendWhatsAppMessage(
      phoneNumberId,
      to,
      bilingual(clinic, 'No active appointment found for today.', 'आज कोई सक्रिय अपॉइंटमेंट नहीं मिला।'),
    );
    return;
  }

  const apt = aptSnap.docs[0].data();
  const myToken = apt.tokenNumber;
  let position = 0;
  let waitMins = 0;

  if (myToken && currentToken) {
    position = Math.max(0, myToken - currentToken);
    waitMins = position * (clinic.avgConsultationMinutes || 15);
  }

  const msg = bilingual(
    clinic,
    `Now serving: Token #${currentToken || '—'}\nYour token: #${myToken || '—'}\nPatients ahead: ${position}\nEst. wait: ~${waitMins} min`,
    `अभी टोकन: #${currentToken || '—'}\nआपका टोकन: #${myToken || '—'}\nआगे मरीज़: ${position}\nअनुमानित प्रतीक्षा: ~${waitMins} मिनट`,
  );
  await sendWhatsAppMessage(phoneNumberId, to, msg);
}

// ---------------------------------------------------------------------------
// FR-4/5: Appointment reminders (~1 hour before)
// ---------------------------------------------------------------------------

exports.sendReminders = onSchedule('every 15 minutes', async () => {
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

    const timeStr = scheduled.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
    const msg = bilingual(
      clinic,
      `Reminder: Your appointment is at ${timeStr} today.\nReply 1 to confirm, 2 to cancel.`,
      `अनुस्मारक: आज ${timeStr} पर अपॉइंटमेंट है।\nपुष्टि के लिए 1, रद्द के लिए 2 भेजें।`,
    );

    const to = apt.patientPhone.replace('+', '');
    await sendWhatsAppMessage(phoneNumberId, to, msg);
    await docSnap.ref.update({ reminderSent: true });

    await db.collection('patientSessions').doc(`${apt.clinicId}_${to}`).set({
      state: 'reminder_response',
      context: { appointmentId: docSnap.id },
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
});

async function handleReminderResponse(clinic, to, phoneNumberId, text, session, sessionRef) {
  const appointmentId = session.context?.appointmentId;
  if (!appointmentId) return;

  const aptRef = db.collection('appointments').doc(appointmentId);

  if (text === '1') {
    await aptRef.update({ status: 'CONFIRMED' });
    await sendWhatsAppMessage(phoneNumberId, to, bilingual(clinic, 'Confirmed. See you soon!', 'पुष्टि हो गई। जल्द मिलते हैं!'));
  } else if (text === '2') {
    await aptRef.update({ status: 'CANCELLED' });
    await sendWhatsAppMessage(phoneNumberId, to, bilingual(clinic, 'Appointment cancelled.', 'अपॉइंटमेंट रद्द हो गया।'));
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

    const msg = bilingual(
      clinic,
      `A slot opened at ${timeStr} today! Reply YES to claim it.`,
      `आज ${timeStr} पर स्लॉट खुला है! लेने के लिए YES भेजें।`,
    );
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
  if (!['yes', 'हां', 'haan'].includes(text)) {
    await sessionRef.set({ state: 'idle', context: {}, updatedAt: FieldValue.serverTimestamp() });
    return;
  }

  const waitlistId = session.context?.waitlistId;
  const wlRef = db.collection('waitlist').doc(waitlistId);
  const wlSnap = await wlRef.get();
  if (!wlSnap.exists || wlSnap.data().status !== 'OFFERED') {
    await sendWhatsAppMessage(phoneNumberId, to, bilingual(clinic, 'Sorry, this slot was already taken.', 'क्षमा करें, यह स्लॉट पहले ही ले लिया गया।'));
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
  await sendWhatsAppMessage(
    phoneNumberId,
    to,
    bilingual(clinic, `Slot booked! Code: *${bookingCode}*`, `स्लॉट बुक! कोड: *${bookingCode}*`),
  );
}

// ---------------------------------------------------------------------------
// FR-21: Proactive "your turn is approaching" notifications
// ---------------------------------------------------------------------------

exports.notifyApproachingTurn = onSchedule('every 5 minutes', async () => {
  const todayKey = formatDateKey(new Date());
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
        const msg = bilingual(
          clinic,
          `Your turn is approaching! You are #${apt.tokenNumber} — only ${ahead} patient(s) ahead.`,
          `आपकी बारी नज़दीक है! आप #${apt.tokenNumber} पर हैं — सिर्फ ${ahead} मरीज़ आगे।`,
        );
        await sendWhatsAppMessage(phoneNumberId, to, msg);
        await docSnap.ref.update({ approachNotified: true });
      }
    }
  }
});

// ---------------------------------------------------------------------------
// FR-11: Daily morning brief to doctor
// ---------------------------------------------------------------------------

exports.dailyBrief = onSchedule('0 7 * * *', async () => {
  const todayKey = formatDateKey(new Date());
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
      ? first.scheduledTime.toDate().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
      : 'No appointments';

    const msg = `Good morning, ${clinic.name}!\n\nPatients today: ${aptsSnap.size}\nFirst appointment: ${firstTime}\n\nHave a great clinic day.`;
    await sendWhatsAppMessage(clinic.whatsappPhoneNumberId, clinic.doctorWhatsApp.replace('+', ''), msg);
  }
});

// ---------------------------------------------------------------------------
// FR-12: Monday weekly summary
// ---------------------------------------------------------------------------

exports.weeklySummary = onSchedule('0 8 * * 1', async () => {
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
});

// ---------------------------------------------------------------------------
// Slot builder helpers
// ---------------------------------------------------------------------------

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildSlotsForDay(clinic, date) {
  const [startH, startM] = (clinic.workingHours?.start || '09:00').split(':').map(Number);
  const [endH, endM] = (clinic.workingHours?.end || '18:00').split(':').map(Number);
  const duration = clinic.slotDurationMinutes || 30;

  const slots = [];
  const cursor = new Date(date);
  cursor.setHours(startH, startM, 0, 0);
  const end = new Date(date);
  end.setHours(endH, endM, 0, 0);

  while (cursor < end) {
    if (cursor > new Date()) {
      const label = cursor.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      slots.push({ time: new Date(cursor), label });
    }
    cursor.setMinutes(cursor.getMinutes() + duration);
  }
  return slots.slice(0, 8);
}
