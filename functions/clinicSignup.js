const { onRequest } = require('firebase-functions/v2/https');
const { defineString } = require('firebase-functions/params');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const crypto = require('crypto');
const { sendWelcomeEmail } = require('./emailService');

const db = getFirestore();

const smtpHost = defineString('SMTP_HOST', { default: 'smtp.gmail.com' });
const smtpPort = defineString('SMTP_PORT', { default: '587' });
const smtpUser = defineString('SMTP_USER', { default: '' });
const smtpPass = defineString('SMTP_PASS', { default: '' });
const smtpFrom = defineString('SMTP_FROM', { default: '' });
const appLoginUrl = defineString('APP_LOGIN_URL', {
  default: 'https://clinic-desk.vercel.app',
});

const REQUIRED_FIELDS = ['clinicName', 'yourName', 'email'];

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function randomPassword() {
  return crypto.randomBytes(24).toString('base64url');
}

function pickPayload(body) {
  return {
    clinicName: String(body.clinicName || '').trim(),
    clinicType: String(body.clinicType || '').trim(),
    doctorCount: String(body.doctorCount || '').trim(),
    city: String(body.city || '').trim(),
    state: String(body.state || '').trim(),
    footfall: String(body.footfall || '').trim(),
    yourName: String(body.yourName || '').trim(),
    yourRole: String(body.yourRole || '').trim(),
    whatsapp: String(body.whatsapp || '').trim(),
    email: normalizeEmail(body.email),
    bookingMethod: String(body.bookingMethod || '').trim(),
    painPoints: Array.isArray(body.painPoints) ? body.painPoints : [],
    goLive: String(body.goLive || '').trim(),
    hearAbout: String(body.hearAbout || '').trim(),
    notes: String(body.notes || '').trim(),
  };
}

function validatePayload(payload) {
  for (const field of REQUIRED_FIELDS) {
    if (!payload[field]) {
      return `Missing required field: ${field}`;
    }
  }
  if (!isValidEmail(payload.email)) {
    return 'Invalid email address';
  }
  return null;
}

async function ensureFirebaseUser(email, displayName) {
  const auth = getAuth();
  try {
    const existing = await auth.getUserByEmail(email);
    return { uid: existing.uid, created: false };
  } catch (err) {
    if (err.code !== 'auth/user-not-found') {
      throw err;
    }
  }

  const user = await auth.createUser({
    email,
    password: randomPassword(),
    displayName,
    emailVerified: false,
  });

  return { uid: user.uid, created: true };
}

const clinicSignup = onRequest(
  {
    cors: true,
    timeoutSeconds: 60,
  },
  async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    try {
      const payload = pickPayload(req.body || {});
      const validationError = validatePayload(payload);
      if (validationError) {
        res.status(400).json({ success: false, error: validationError });
        return;
      }

      const clinicRef = db.collection('clinics').doc();
      const clinicId = clinicRef.id;
      const onboardingRef = db.collection('onboardingRequests').doc();

      const { uid, created } = await ensureFirebaseUser(payload.email, payload.yourName);

      await getAuth().setCustomUserClaims(uid, {
        clinicId,
        role: 'owner',
      });

      const loginUrl = appLoginUrl.value();
      const passwordSetupLink = await getAuth().generatePasswordResetLink(payload.email, {
        url: loginUrl,
        handleCodeInApp: false,
      });

      const batch = db.batch();

      batch.set(clinicRef, {
        name: payload.clinicName,
        clinicType: payload.clinicType,
        doctorCount: payload.doctorCount,
        city: payload.city,
        state: payload.state,
        footfall: payload.footfall,
        ownerUid: uid,
        ownerEmail: payload.email,
        ownerName: payload.yourName,
        ownerRole: payload.yourRole,
        whatsapp: payload.whatsapp,
        bookingMethod: payload.bookingMethod,
        painPoints: payload.painPoints,
        goLive: payload.goLive,
        hearAbout: payload.hearAbout,
        status: 'pending_setup',
        workingHours: { start: '09:00', end: '18:00', days: [1, 2, 3, 4, 5, 6] },
        slotDurationMinutes: 30,
        avgConsultationMinutes: 15,
        doctorIds: [],
        createdAt: FieldValue.serverTimestamp(),
      });

      batch.set(onboardingRef, {
        ...payload,
        clinicId,
        ownerUid: uid,
        userCreated: created,
        createdAt: FieldValue.serverTimestamp(),
      });

      await batch.commit();

      const smtp = {
        host: smtpHost.value(),
        port: Number(smtpPort.value()) || 587,
        user: smtpUser.value() || '',
        pass: smtpPass.value() || '',
        from: smtpFrom.value() || smtpUser.value() || 'Clinic Desk <noreply@clinicdesk.app>',
      };

      const emailResult = await sendWelcomeEmail({
        to: payload.email,
        clinicName: payload.clinicName,
        yourName: payload.yourName,
        loginUrl,
        passwordSetupLink,
        smtp,
      });

      res.status(200).json({
        success: true,
        clinicId,
        email: payload.email,
        emailChannel: emailResult.channel,
        message: 'Account created. Check your email to set your password and log in.',
      });
    } catch (err) {
      console.error('clinicSignup error:', err);
      const message = err instanceof Error ? err.message : 'Signup failed';
      res.status(500).json({ success: false, error: message });
    }
  },
);

module.exports = { clinicSignup };
