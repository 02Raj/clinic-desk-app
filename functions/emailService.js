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
    <div style="font-family: Inter, Arial, sans-serif; max-width: 560px; color: #1B2A20;">
      <p>Hi ${yourName},</p>
      <p>Welcome to <strong>Clinic Desk</strong>! Your clinic <strong>${clinicName}</strong> has been registered.</p>
      <p style="margin: 24px 0;">
        <a href="${passwordSetupLink}" style="background:#1B2A20;color:#F5EFE6;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
          Set your password
        </a>
      </p>
      <p style="font-size: 14px; color: #66736A;">This link expires in 24 hours. We never send your password by email.</p>
      <p>After setting your password, log in here:<br/>
        <a href="${loginUrl}">${loginUrl}</a>
      </p>
      <p style="font-size: 14px; color: #66736A;">We will reach out on WhatsApp within 24 hours to help finish your clinic setup.</p>
      <p>— Clinic Desk Team</p>
    </div>
  `;

  return { subject, text, html };
}

/**
 * Send welcome email via SMTP (nodemailer).
 * If SMTP is not configured, queues to Firestore `mail` collection
 * for the Firebase "Trigger Email" extension.
 */
async function sendWelcomeEmail({ to, clinicName, yourName, loginUrl, passwordSetupLink, smtp }) {
  const { subject, text, html } = buildWelcomeEmail({
    clinicName,
    yourName,
    loginUrl,
    passwordSetupLink,
  });

  if (isSmtpConfigured(smtp)) {
    try {
      const transport = createTransport(smtp);
      await transport.sendMail({
        from: smtp.from,
        to,
        subject,
        text,
        html,
      });
      return { channel: 'smtp' };
    } catch (err) {
      console.error('SMTP send failed, queuing to Firestore mail collection:', err.message);
    }
  }

  await db.collection('mail').add({
    to: [to],
    message: { subject, text, html },
    createdAt: new Date().toISOString(),
    template: 'clinic-signup-welcome',
  });

  return { channel: 'firestore-mail-queue' };
}

module.exports = { sendWelcomeEmail, buildWelcomeEmail };
