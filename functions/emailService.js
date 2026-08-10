const { Resend } = require('resend');
const nodemailer = require('nodemailer');
const { getFirestore } = require('firebase-admin/firestore');

const db = getFirestore();

function isSmtpConfigured(smtp) {
  return Boolean(
    smtp.user &&
    smtp.pass &&
    smtp.user.includes('@') &&
    smtp.pass !== 'not-configured',
  );
}

function createTransport(smtp) {
  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });
}

function buildWelcomeEmail({ clinicName, yourName, loginUrl, passwordSetupLink }) {
  const subject = `Your Clinic Desk account for ${clinicName}`;
  const text = [
    `Hi ${yourName},`,
    '',
    `Welcome to Clinic Desk! Your clinic "${clinicName}" has been registered.`,
    '',
    'Set your password (link expires in 24 hours):',
    passwordSetupLink,
    '',
    `After setting your password, log in here: ${loginUrl}`,
    '',
    'We will reach out on WhatsApp within 24 hours to help finish your clinic setup.',
    '',
    '— Clinic Desk Team',
  ].join('\n');

  const html = `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; color: #1B2A20; background: #F7F3EC; padding: 32px 28px;">
      <p style="margin: 0 0 4px; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: #66736A;">Clinic Desk</p>
      <h1 style="margin: 0 0 20px; font-size: 28px; font-weight: 700; color: #1B2A20;">Welcome, ${yourName}</h1>
      <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.5;">Your clinic <strong>${clinicName}</strong> is registered. Set your password to open the desk.</p>
      <p style="margin: 28px 0;">
        <a href="${passwordSetupLink}" style="background:#1B2A20;color:#F5EFE6;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;font-family: Arial, sans-serif;">
          Set your password
        </a>
      </p>
      <p style="margin: 0 0 12px; font-size: 14px; color: #66736A; font-family: Arial, sans-serif;">This link expires in 24 hours. We never send your password by email.</p>
      <p style="margin: 0 0 12px; font-size: 14px; font-family: Arial, sans-serif;">After setting your password, log in here:<br/>
        <a href="${loginUrl}" style="color:#1B2A20;">${loginUrl}</a>
      </p>
      <p style="margin: 24px 0 0; font-size: 14px; color: #66736A; font-family: Arial, sans-serif;">We will reach out on WhatsApp within 24 hours to help finish your clinic setup.</p>
      <p style="margin: 20px 0 0; font-size: 14px;">— Clinic Desk Team</p>
    </div>
  `;

  return { subject, text, html };
}

async function sendWithResend({ to, subject, text, html, apiKey, from }) {
  const key = String(apiKey || '').trim();
  if (!key) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const resend = new Resend(key);
  const { data, error } = await resend.emails.send({
    from: from || 'Clinic Desk <onboarding@resend.dev>',
    to: [to],
    subject,
    text,
    html,
  });

  if (error) {
    throw new Error(error.message || 'Resend send failed');
  }

  return { channel: 'resend', id: data?.id || null };
}

/**
 * Firebase Auth sends its own password-reset email (no Gmail SMTP needed).
 * Uses the project's Email/Password template from Authentication → Templates.
 */
async function sendFirebaseAuthResetEmail({ to, loginUrl, apiKey }) {
  if (!apiKey) {
    throw new Error('AUTH_WEB_API_KEY is not configured');
  }

  const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requestType: 'PASSWORD_RESET',
      email: to,
      continueUrl: loginUrl,
      canHandleCodeInApp: false,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || `Firebase Auth email failed (${res.status})`;
    throw new Error(msg);
  }

  return { channel: 'firebase-auth-email' };
}

/**
 * Prefer Resend branded welcome email.
 * Fallbacks: SMTP → Firebase Auth password-reset → Firestore mail queue.
 */
async function sendWelcomeEmail({
  to,
  clinicName,
  yourName,
  loginUrl,
  passwordSetupLink,
  smtp,
  firebaseWebApiKey,
  resendApiKey,
  resendFrom,
}) {
  const { subject, text, html } = buildWelcomeEmail({
    clinicName,
    yourName,
    loginUrl,
    passwordSetupLink,
  });

  if (resendApiKey) {
    try {
      return await sendWithResend({
        to,
        subject,
        text,
        html,
        apiKey: resendApiKey,
        from: resendFrom,
      });
    } catch (err) {
      console.error('Resend send failed, trying next channel:', err.message);
    }
  }

  if (isSmtpConfigured(smtp)) {
    try {
      const transport = createTransport({
        ...smtp,
        user: String(smtp.user || '').trim(),
        pass: String(smtp.pass || '').replace(/\s+/g, ''),
      });
      await transport.sendMail({
        from: smtp.from,
        to,
        subject,
        text,
        html,
      });
      return { channel: 'smtp' };
    } catch (err) {
      console.error(
        'SMTP send failed (user=%s), falling back to Firebase Auth email:',
        smtp.user,
        err.message,
      );
    }
  }

  try {
    return await sendFirebaseAuthResetEmail({
      to,
      loginUrl,
      apiKey: firebaseWebApiKey,
    });
  } catch (authErr) {
    console.error('Firebase Auth password-reset email failed:', authErr.message);
  }

  await db.collection('mail').add({
    to: [to],
    message: { subject, text, html },
    createdAt: new Date().toISOString(),
    template: 'clinic-signup-welcome',
  });

  return { channel: 'firestore-mail-queue' };
}

module.exports = { sendWelcomeEmail, buildWelcomeEmail, sendFirebaseAuthResetEmail };
