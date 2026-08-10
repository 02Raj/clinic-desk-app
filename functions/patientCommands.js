/**
 * Global patient commands — STATUS, HERE, queue (works on Twilio + Meta).
 */
const { FieldValue } = require('firebase-admin/firestore');
const { formatDateKey, getISTDate } = require('./whatsappFlow');

async function findTodaysAppointmentForCheckIn(db, clinicId, patientPhone, todayKey) {
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

async function handleQueueStatus(db, clinic, to, phoneNumberId, send) {
  const todayKey = formatDateKey(getISTDate());
  const patientPhone = `+${to}`;

  const snap = await db
    .collection('appointments')
    .where('clinicId', '==', clinic.id)
    .where('patientPhone', '==', patientPhone)
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
    await send.text(phoneNumberId, to, 'No active appointment found for today.\n\nReply *MENU* to book.');
    return;
  }

  const apt = aptDoc.data();
  const myToken = apt.tokenNumber;
  const timeStr = apt.scheduledTime?.toDate?.().toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });

  if (!myToken) {
    const msg = `📋 *Appointment Status*\n\n🆔 ${apt.appointmentId || apt.bookingCode}\n👨‍⚕️ ${apt.doctorName || 'Doctor'}\n⏰ ${timeStr || 'Today'}\n📌 Status: *${apt.status}*\n🔑 Code: *${apt.bookingCode}*\n\nReply *HERE* when you arrive at the clinic.`;
    await send.text(phoneNumberId, to, msg);
    return;
  }

  let position = 0;
  let waitMins = 0;
  if (myToken && currentToken) {
    position = Math.max(0, myToken - currentToken);
    waitMins = position * (clinic.avgConsultationMinutes || 15);
  }

  const msg = `📊 *Queue Status*\n\nNow serving: Token #${currentToken || '—'}\nYour token: #${myToken}\nPatients ahead: ${position}\nEst. wait: ~${waitMins} min\n\nReply *STATUS* anytime to refresh.`;
  await send.text(phoneNumberId, to, msg);
}

async function handleHereCheckIn(db, clinic, to, phoneNumberId, sessionRef, send) {
  const todayKey = formatDateKey(getISTDate());
  const patientPhone = `+${to}`;

  const aptDoc = await findTodaysAppointmentForCheckIn(db, clinic.id, patientPhone, todayKey);

  if (!aptDoc) {
    await send.text(
      phoneNumberId,
      to,
      "We couldn't find an appointment for you today. Reply *MENU* to book one.",
    );
    return;
  }

  const existing = aptDoc.data();
  if (existing.status === 'CHECKED_IN' && existing.tokenNumber) {
    await send.text(
      phoneNumberId,
      to,
      `Already checked in! Your token number is #${existing.tokenNumber}.\n\nReply *STATUS* for queue update.`,
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

  await sessionRef.set({ state: 'menu', context: {}, updatedAt: FieldValue.serverTimestamp() });
  await send.text(
    phoneNumberId,
    to,
    `✅ Checked in! Your token number is *#${tokenNumber}*.\n\nPlease wait in the reception area.\nReply *STATUS* for queue updates.`,
  );
}

function isGlobalPatientCommand(text) {
  const t = String(text || '').trim().toLowerCase();
  return ['status', 'queue', 'position', 'here'].includes(t);
}

async function handleGlobalPatientCommand(db, clinic, from, phoneNumberId, sessionRef, send, text) {
  const t = String(text || '').trim().toLowerCase();
  if (['status', 'queue', 'position'].includes(t)) {
    await handleQueueStatus(db, clinic, from, phoneNumberId, send);
    return true;
  }
  if (t === 'here') {
    await handleHereCheckIn(db, clinic, from, phoneNumberId, sessionRef, send);
    return true;
  }
  return false;
}

module.exports = {
  handleQueueStatus,
  handleHereCheckIn,
  isGlobalPatientCommand,
  handleGlobalPatientCommand,
};
