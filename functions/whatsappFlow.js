const { FieldValue, Timestamp } = require('firebase-admin/firestore');

const DEFAULT_DOCTORS = [
  { id: 'doc-01', name: 'Dr. Rajesh Sharma', title: 'General Physician', consultationFee: 500 },
  { id: 'doc-02', name: 'Dr. Neha Mehta', title: 'Orthopedic', consultationFee: 600 },
  { id: 'doc-03', name: 'Dr. Imran Khan', title: 'Dermatologist', consultationFee: 700 },
];

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

function formatDisplayDate(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function istWallClockToUtcMs(y, month, day, hour, minute) {
  return Date.UTC(y, month, day, hour, minute) - 5.5 * 3600000;
}

function buildSlotsForDay(clinic, istDate) {
  const [startH, startM] = (clinic.workingHours?.start || '09:00').split(':').map(Number);
  const [endH, endM] = (clinic.workingHours?.end || '21:00').split(':').map(Number);
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
      slots.push({ time: new Date(slotMs), label, timeMs: slotMs });
    }
    cursorM += duration;
    while (cursorM >= 60) {
      cursorM -= 60;
      cursorH += 1;
    }
  }
  return slots.slice(0, 8);
}

function generateBookingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generateAppointmentId(dateKey) {
  const compact = dateKey.replace(/-/g, '');
  return `APT-${compact}-${generateBookingCode()}`;
}

function extractMessageInput(message) {
  if (message.type === 'text') {
    return { text: message.text.body.trim(), raw: message.text.body.trim() };
  }
  if (message.type === 'interactive') {
    const { interactive } = message;
    if (interactive.type === 'button_reply') {
      return { text: interactive.button_reply.id, raw: interactive.button_reply.title };
    }
    if (interactive.type === 'list_reply') {
      return { text: interactive.list_reply.id, raw: interactive.list_reply.title };
    }
  }
  return null;
}

async function getDoctorsForClinic(db, clinic) {
  const snap = await db.collection('doctors').where('clinicId', '==', clinic.id).get();
  if (!snap.empty) {
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  return DEFAULT_DOCTORS.map((d) => ({ ...d, clinicId: clinic.id }));
}

async function getReturningPatientName(db, clinicId, phone) {
  const snap = await db
    .collection('appointments')
    .where('clinicId', '==', clinicId)
    .where('patientPhone', '==', phone)
    .limit(10)
    .get();
  if (snap.empty) return null;
  const sorted = snap.docs
    .map((d) => d.data())
    .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
  const name = sorted[0]?.patientName;
  return name && !name.startsWith('Patient ') ? name : null;
}

async function setSession(sessionRef, state, context = {}) {
  await sessionRef.set({ state, context, updatedAt: FieldValue.serverTimestamp() });
}

async function showMainMenu(clinic, to, phoneNumberId, sessionRef, patientName, send) {
  const greeting = patientName
    ? `👋 Welcome back, *${patientName}*!`
    : `👋 Welcome to *${clinic.name || 'our clinic'}*!`;

  const body = `${greeting}\n\nHow can we help you today?`;

  if (phoneNumberId === 'twilio' && send.list) {
    await send.list(phoneNumberId, to, {
      body,
      button: 'Select option',
      items: [
        { id: 'menu_1', item: '📅 Book Appointment', description: 'Book a new visit' },
        { id: 'menu_2', item: '👁 View Appointment', description: 'See today\'s booking' },
        { id: 'menu_3', item: '❌ Cancel Appointment', description: 'Cancel a booking' },
        { id: 'menu_4', item: 'ℹ️ Clinic Info', description: 'Hours, fees, location' },
      ],
    });
  } else {
    const textBody = `${body}\n\n1️⃣ Book Appointment\n2️⃣ View Appointment\n3️⃣ Cancel Appointment\n4️⃣ Clinic Information\n\nReply with a number (1–4) or type *BOOK*, *VIEW*, *CANCEL*, or *INFO*.`;
    await send.text(phoneNumberId, to, textBody);
  }

  await setSession(sessionRef, 'menu', { patientName: patientName || null });
}

async function showDoctorList(clinic, to, phoneNumberId, sessionRef, send, db) {
  const doctors = await getDoctorsForClinic(db, clinic);

  if (phoneNumberId === 'twilio' && send.list) {
    await send.list(phoneNumberId, to, {
      body: 'Please select the doctor you\'d like to consult.',
      button: 'Choose doctor',
      items: doctors.map((d, i) => ({
        id: `doctor_${i + 1}`,
        item: d.name.slice(0, 24),
        description: `${d.title} • ₹${d.consultationFee || 500}`,
      })),
    });
  } else {
    const lines = doctors.map((d, i) => `${i + 1}. ${d.name} — ${d.title}`).join('\n');
    const body = `Please select the doctor you'd like to consult.\n\n${lines}\n\nReply with the doctor number.`;
    await send.text(phoneNumberId, to, body);
  }

  await setSession(sessionRef, 'booking_doctor', {
    doctors: doctors.map((d) => ({
      id: d.id,
      name: d.name,
      title: d.title,
      consultationFee: d.consultationFee || 500,
    })),
  });
}

async function showDoctorProfile(clinic, to, phoneNumberId, sessionRef, doctor, send) {
  const today = getISTDate();
  const slots = buildSlotsForDay(clinic, today);
  const nextSlot = slots[0]?.label || 'No slots today';

  const body = `*${doctor.name}*\n🩺 ${doctor.title}\n💰 Consultation Fee: ₹${doctor.consultationFee}\n📅 Available Today — Next Slot: ${nextSlot}`;

  if (phoneNumberId === 'twilio' && send.buttons) {
    await send.buttons(phoneNumberId, to, {
      body,
      actions: [
        { id: 'confirm_continue', title: 'Continue' },
        { id: 'confirm_other_doctor', title: 'Other doctor' },
      ],
    });
  } else {
    await send.text(phoneNumberId, to, `${body}\n\nReply *1* to Continue\nReply *2* to Select Another Doctor`);
  }

  await setSession(sessionRef, 'booking_doctor_confirm', { doctor });
}

async function showDatePicker(to, phoneNumberId, sessionRef, send, context) {
  const body = 'Please select your preferred date.';

  if (phoneNumberId === 'twilio' && send.buttons) {
    await send.buttons(phoneNumberId, to, {
      body,
      actions: [
        { id: 'date_today', title: 'Today' },
        { id: 'date_tomorrow', title: 'Tomorrow' },
      ],
    });
  } else {
    await send.text(phoneNumberId, to, `${body}\n\n1️⃣ Today\n2️⃣ Tomorrow\n\nReply *1* or *2*.`);
  }

  await setSession(sessionRef, 'booking_date', context);
}

async function showSlots(clinic, to, phoneNumberId, sessionRef, send, context, dateKey, istDate) {
  const slots = buildSlotsForDay(clinic, istDate);
  const label = dateKey === formatDateKey(getISTDate()) ? 'Today' : 'Tomorrow';

  if (slots.length === 0) {
    const hours = clinic.workingHours || { start: '09:00', end: '21:00' };
    await send.text(
      phoneNumberId,
      to,
      `No slots available for ${label}.\n\nClinic hours: ${hours.start} – ${hours.end}.\nReply *MENU* to go back.`,
    );
    await setSession(sessionRef, 'menu', {});
    return;
  }

  const lines = slots.map((s, i) => `${i + 1}. ${s.label}`).join('\n');

  if (phoneNumberId === 'twilio' && send.list) {
    await send.list(phoneNumberId, to, {
      body: `Available time slots for *${label}*`,
      button: 'Choose time',
      items: slots.map((s, i) => ({
        id: `slot_${i + 1}`,
        item: s.label.slice(0, 24),
        description: `Slot ${i + 1} on ${label}`,
      })),
    });
  } else {
    await send.text(
      phoneNumberId,
      to,
      `Available time slots for *${label}*\n\n${lines}\n\nReply with the slot number.`,
    );
  }
  await setSession(sessionRef, 'booking_slot', {
    ...context,
    dateKey,
    slots: slots.map((s) => ({ label: s.label, timeMs: s.timeMs })),
  });
}

async function askPatientDetails(to, phoneNumberId, sessionRef, send, context, patientName) {
  const hint = patientName
    ? `We have your name as *${patientName}*. Reply to confirm or send updated details.\n\n`
    : '';
  const body = `${hint}Please share your details in one message:\n\n*Name, Age, Reason*\n\nExamples:\n• Divyansh Raj, 25, Headache\n• divyansh 25 sar dard\n• One per line:\n  Divyansh Raj\n  25\n  Headache`;

  await send.text(phoneNumberId, to, body);
  await setSession(sessionRef, 'booking_details', { ...context, knownName: patientName || null });
}

function titleCaseWords(text) {
  return String(text || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function parsePatientDetails(raw, knownName) {
  const normalized = String(raw || '').trim();
  if (!normalized) return null;

  const isAge = (value) => /^\d{1,3}$/.test(String(value || '').trim());

  let parts = normalized.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length < 3) {
    parts = normalized.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  }

  if (parts.length < 3) {
    const tokens = normalized.split(/\s+/).filter(Boolean);
    const ageIdx = tokens.findIndex((token, index) => index > 0 && isAge(token));
    if (ageIdx > 0) {
      const name = tokens.slice(0, ageIdx).join(' ');
      const age = tokens[ageIdx];
      const reason = tokens.slice(ageIdx + 1).join(' ');
      if (name && reason) {
        return {
          name: titleCaseWords(name) || knownName || 'Patient',
          age,
          gender: 'Not specified',
          reason: titleCaseWords(reason),
        };
      }
    }
  }

  if (parts.length < 2) return null;

  if (parts.length >= 4) {
    return {
      name: parts[0] || knownName || 'Patient',
      age: parts[1],
      gender: parts[2],
      reason: parts.slice(3).join(', '),
    };
  }

  if (parts.length === 3 && isAge(parts[1])) {
    return {
      name: parts[0] || knownName || 'Patient',
      age: parts[1],
      gender: 'Not specified',
      reason: parts[2],
    };
  }

  if (parts.length === 3 && !isAge(parts[1])) {
    return {
      name: parts[0] || knownName || 'Patient',
      age: 'Not specified',
      gender: parts[1],
      reason: parts[2],
    };
  }

  if (parts.length === 2 && isAge(parts[1])) {
    return {
      name: parts[0] || knownName || 'Patient',
      age: parts[1],
      gender: 'Not specified',
      reason: 'General consultation',
    };
  }

  return null;
}

async function showConfirmation(clinic, to, phoneNumberId, sessionRef, send, context) {
  const slotTime = new Date(context.slotTimeMs);
  const timeStr = slotTime.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });

  const body = `Please review your appointment.\n\n👨‍⚕️ Doctor: ${context.doctor.name}\n📅 Date: ${formatDisplayDate(context.dateKey)}\n⏰ Time: ${timeStr}\n👤 Patient: ${context.patient.name}\n🎂 Age: ${context.patient.age}\n⚧ Gender: ${context.patient.gender}\n📝 Reason: ${context.patient.reason}\n💰 Fee: ₹${context.doctor.consultationFee}`;

  if (phoneNumberId === 'twilio' && send.buttons) {
    await send.buttons(phoneNumberId, to, {
      body,
      actions: [
        { id: 'booking_confirm', title: '✅ Confirm' },
        { id: 'booking_edit', title: '✏️ Edit' },
        { id: 'booking_cancel', title: '❌ Cancel' },
      ],
    });
  } else {
    await send.text(phoneNumberId, to, `${body}\n\nReply *1* ✅ Confirm\nReply *2* ✏️ Edit Details\nReply *3* ❌ Cancel`);
  }

  await setSession(sessionRef, 'booking_confirm', context);
}

async function finalizeBooking(clinic, to, phoneNumberId, sessionRef, send, db, context) {
  const bookingCode = generateBookingCode();
  const appointmentId = generateAppointmentId(context.dateKey);
  const slotTime = new Date(context.slotTimeMs);

  await db.collection('appointments').doc().set({
    clinicId: clinic.id,
    doctorId: context.doctor.id,
    doctorName: context.doctor.name,
    patientPhone: `+${to}`,
    patientName: context.patient.name,
    patientAge: context.patient.age,
    patientGender: context.patient.gender,
    reasonForVisit: context.patient.reason,
    scheduledTime: Timestamp.fromDate(slotTime),
    dateKey: context.dateKey,
    status: 'BOOKED',
    bookingCode,
    appointmentId,
    source: 'whatsapp',
    createdAt: FieldValue.serverTimestamp(),
  });

  const timeStr = slotTime.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });

  const body = `✅ Your appointment has been confirmed!\n\n🆔 Appointment ID: *${appointmentId}*\n👨‍⚕️ Doctor: ${context.doctor.name}\n📅 Date: ${formatDisplayDate(context.dateKey)}\n⏰ Time: ${timeStr}\n💰 Consultation Fee: ₹${context.doctor.consultationFee}\n📍 ${clinic.name || 'Clinic'}\n🔑 Booking Code: *${bookingCode}*\n\nReply *HERE* when you arrive at the clinic.\nReply *STATUS* anytime to check your queue position.`;

  await send.text(phoneNumberId, to, body);
  await setSession(sessionRef, 'menu', {});
}

const ACTIVE_STATUSES = ['BOOKED', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'];
const CANCELLABLE_STATUSES = ['BOOKED', 'CONFIRMED'];

async function findTodayAppointment(db, clinicId, phone, allowedStatuses) {
  const todayKey = formatDateKey(getISTDate());
  const snap = await db
    .collection('appointments')
    .where('clinicId', '==', clinicId)
    .where('patientPhone', '==', phone)
    .where('dateKey', '==', todayKey)
    .get();

  const match = snap.docs.find((d) => allowedStatuses.includes(d.data().status));
  return match || null;
}

async function viewAppointment(clinic, to, phoneNumberId, send, db) {
  const aptDoc = await findTodayAppointment(db, clinic.id, `+${to}`, ACTIVE_STATUSES);

  if (!aptDoc) {
    await send.text(
      phoneNumberId,
      to,
      'No active appointment found for today.\n\nReply *1* to book a new appointment.',
    );
    return;
  }

  const apt = aptDoc.data();
  const timeStr = apt.scheduledTime.toDate().toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });

  const tokenLine = apt.tokenNumber ? `\n🎫 Your Token: #${apt.tokenNumber}` : '';
  const body = `📋 *Appointment Confirmed*\n\n🆔 ${apt.appointmentId || apt.bookingCode}\n👨‍⚕️ Doctor: ${apt.doctorName || apt.doctorId}\n📅 Date: ${formatDisplayDate(apt.dateKey)}\n⏰ Time: ${timeStr}\n📌 Status: ${apt.status}${tokenLine}\n🔑 Code: *${apt.bookingCode}*`;

  await send.text(phoneNumberId, to, body);
}

async function cancelAppointmentFlow(clinic, to, phoneNumberId, sessionRef, send, db) {
  const aptDoc = await findTodayAppointment(db, clinic.id, `+${to}`, CANCELLABLE_STATUSES);

  if (!aptDoc) {
    await send.text(phoneNumberId, to, 'No cancellable appointment found for today.');
    await setSession(sessionRef, 'menu', {});
    return;
  }

  const apt = aptDoc;
  const timeStr = apt.data().scheduledTime.toDate().toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });

  const prompt = `Cancel appointment at *${timeStr}*?`;

  if (phoneNumberId === 'twilio' && send.buttons) {
    await send.buttons(phoneNumberId, to, {
      body: prompt,
      actions: [
        { id: 'cancel_yes', title: 'Yes, cancel' },
        { id: 'cancel_no', title: 'No, keep it' },
      ],
    });
  } else {
    await send.text(phoneNumberId, to, `${prompt}\n\nReply *1* Yes, cancel\nReply *2* No, keep it`);
  }

  await setSession(sessionRef, 'cancel_confirm', { appointmentId: apt.id });
}

async function showClinicInfo(clinic, to, phoneNumberId, send) {
  const hours = clinic.workingHours || { start: '09:00', end: '21:00' };
  const body = `📍 *${clinic.name || 'Clinic'}*\n\n🕐 Hours: ${hours.start} – ${hours.end}\n📞 Contact reception for directions and fees.\n\nReply *MENU* for main menu.`;
  await send.text(phoneNumberId, to, body);
}

function normalizeChoice(text) {
  const t = text.toLowerCase().trim();

  if (t.startsWith('menu_')) return t.replace('menu_', '');
  if (t.startsWith('doctor_')) return t.replace('doctor_', '');
  if (t.startsWith('slot_')) return t.replace('slot_', '');
  if (t === 'date_today') return '1';
  if (t === 'date_tomorrow') return '2';
  if (t === 'confirm_continue') return '1';
  if (t === 'confirm_other_doctor') return '2';
  if (t === 'booking_confirm') return '1';
  if (t === 'booking_edit') return '2';
  if (t === 'booking_cancel') return '3';
  if (t === 'cancel_yes') return '1';
  if (t === 'cancel_no') return '2';

  const map = {
    '1': '1', book: '1', 'book appointment': '1',
    '2': '2', view: '2', 'view appointment': '2',
    '3': '3', cancel: '3', 'cancel appointment': '3',
    '4': '4', info: '4', 'clinic information': '4', 'clinic info': '4',
    menu: 'menu', '0': 'menu',
    yes: '1', no: '2',
    confirm: '1', edit: '2',
    today: '1', tomorrow: '2',
    continue: '1',
  };
  return map[t] || t;
}

async function handleDoctorFlowMessage({
  db,
  clinic,
  from,
  message,
  phoneNumberId,
  sessionRef,
  session,
  send,
}) {
  const input = extractMessageInput(message);
  if (!input) return false;

  const text = normalizeChoice(input.text);
  const raw = input.raw;
  const state = session.state || 'idle';
  const ctx = session.context || {};

  if (['status', 'queue', 'position', 'here'].includes(text)) {
    const patientCommands = require('./patientCommands');
    return patientCommands.handleGlobalPatientCommand(
      db, clinic, from, phoneNumberId, sessionRef, send, text,
    );
  }

  if (['menu', '0'].includes(text) || ['hi', 'hello', 'start'].includes(text)) {
    const patientName = await getReturningPatientName(db, clinic.id, `+${from}`);
    await showMainMenu(clinic, from, phoneNumberId, sessionRef, patientName, send);
    return true;
  }

  if (state === 'menu') {
    if (text === '1') {
      await showDoctorList(clinic, from, phoneNumberId, sessionRef, send, db);
      return true;
    }
    if (text === '2') {
      await viewAppointment(clinic, from, phoneNumberId, send, db);
      await setSession(sessionRef, 'menu', {});
      return true;
    }
    if (text === '3') {
      await cancelAppointmentFlow(clinic, from, phoneNumberId, sessionRef, send, db);
      return true;
    }
    if (text === '4') {
      await showClinicInfo(clinic, from, phoneNumberId, send);
      return true;
    }
    if (send.aiIntent) {
      const ai = await send.aiIntent(raw, state);
      const mapped = ai ? normalizeChoice(ai.value || ai.action || '') : null;
      if (mapped === '1') {
        await showDoctorList(clinic, from, phoneNumberId, sessionRef, send, db);
        return true;
      }
      if (mapped === '2') {
        await viewAppointment(clinic, from, phoneNumberId, send, db);
        await setSession(sessionRef, 'menu', {});
        return true;
      }
      if (mapped === '3') {
        await cancelAppointmentFlow(clinic, from, phoneNumberId, sessionRef, send, db);
        return true;
      }
      if (mapped === '4') {
        await showClinicInfo(clinic, from, phoneNumberId, send);
        return true;
      }
      if (ai?.action === 'faq' && ai.value) {
        await send.text(phoneNumberId, from, ai.value);
        return true;
      }
    }
    await send.text(phoneNumberId, from, 'Please reply *1*, *2*, *3*, or *4*. Or type *MENU*.');
    return true;
  }

  if (state === 'booking_doctor') {
    const choice = parseInt(text, 10);
    const doctors = ctx.doctors || [];
    if (Number.isNaN(choice) || choice < 1 || choice > doctors.length) {
      await send.text(phoneNumberId, from, 'Invalid choice. Reply with a doctor number.');
      return true;
    }
    await showDoctorProfile(clinic, from, phoneNumberId, sessionRef, doctors[choice - 1], send);
    return true;
  }

  if (state === 'booking_doctor_confirm') {
    if (text === '2') {
      await showDoctorList(clinic, from, phoneNumberId, sessionRef, send, db);
      return true;
    }
    if (text === '1') {
      await showDatePicker(from, phoneNumberId, sessionRef, send, { doctor: ctx.doctor });
      return true;
    }
    await send.text(phoneNumberId, from, 'Reply *1* to Continue or *2* for another doctor.');
    return true;
  }

  if (state === 'booking_date') {
    const today = getISTDate();
    let istDate;
    let dateKey;
    if (text === '1') {
      istDate = today;
      dateKey = formatDateKey(today);
    } else if (text === '2') {
      istDate = new Date(today);
      istDate.setDate(istDate.getDate() + 1);
      dateKey = formatDateKey(istDate);
    } else {
      await send.text(phoneNumberId, from, 'Reply *1* for Today or *2* for Tomorrow.');
      return true;
    }
    await showSlots(clinic, from, phoneNumberId, sessionRef, send, ctx, dateKey, istDate);
    return true;
  }

  if (state === 'booking_slot') {
    const choice = parseInt(text, 10);
    const slots = ctx.slots || [];
    if (Number.isNaN(choice) || choice < 1 || choice > slots.length) {
      await send.text(phoneNumberId, from, 'Invalid slot. Reply with a slot number.');
      return true;
    }
    const slot = slots[choice - 1];
    const patientName = await getReturningPatientName(db, clinic.id, `+${from}`);
    await askPatientDetails(from, phoneNumberId, sessionRef, send, {
      ...ctx,
      slotTimeMs: slot.timeMs,
      slotLabel: slot.label,
    }, patientName);
    return true;
  }

  if (state === 'booking_details') {
    let patient = parsePatientDetails(raw, ctx.knownName);
    if (!patient && send.aiDetails) {
      patient = await send.aiDetails(raw, ctx.knownName);
    }
    if (!patient) {
      await send.text(
        phoneNumberId,
        from,
        'Could not read your details. Please use:\n*Name, Age, Reason*\n\nExamples:\nDivyansh Raj, 25, Headache\nOr one detail per line.',
      );
      return true;
    }
    await showConfirmation(clinic, from, phoneNumberId, sessionRef, send, { ...ctx, patient });
    return true;
  }

  if (state === 'booking_confirm') {
    if (text === '3') {
      await send.text(phoneNumberId, from, 'Booking cancelled. Reply *MENU* to start again.');
      await setSession(sessionRef, 'menu', {});
      return true;
    }
    if (text === '2') {
      await askPatientDetails(from, phoneNumberId, sessionRef, send, ctx, ctx.patient?.name);
      return true;
    }
    if (text === '1') {
      await finalizeBooking(clinic, from, phoneNumberId, sessionRef, send, db, ctx);
      return true;
    }
    await send.text(phoneNumberId, from, 'Reply *1* Confirm, *2* Edit, or *3* Cancel.');
    return true;
  }

  if (state === 'cancel_confirm') {
    if (text === '1') {
      await db.collection('appointments').doc(ctx.appointmentId).update({ status: 'CANCELLED' });
      await send.text(phoneNumberId, from, '❌ Appointment cancelled.\n\nReply *MENU* for main menu.');
      await setSession(sessionRef, 'menu', {});
      return true;
    }
    if (text === '2') {
      await send.text(phoneNumberId, from, 'Appointment kept. See you soon!');
      await setSession(sessionRef, 'menu', {});
      return true;
    }
    await send.text(phoneNumberId, from, 'Reply *1* to cancel or *2* to keep appointment.');
    return true;
  }

  return false;
}

module.exports = {
  extractMessageInput,
  getISTDate,
  formatDateKey,
  buildSlotsForDay,
  generateBookingCode,
  handleDoctorFlowMessage,
  showMainMenu,
  getReturningPatientName,
  DEFAULT_DOCTORS,
};
