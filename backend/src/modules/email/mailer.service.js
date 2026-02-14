import nodemailer from 'nodemailer';
import { decryptSecret } from '../../security/crypto.js';
import { getEventSmtpConfigByEventId } from '../events/events.repository.js';

function resolveTransportSecurity(security) {
  if (security === 'tls') {
    return { secure: true, requireTLS: true };
  }

  if (security === 'starttls') {
    return { secure: false, requireTLS: true };
  }

  return { secure: false, requireTLS: false };
}

export async function sendVerificationEmail(job) {
  const smtp = await getEventSmtpConfigByEventId(job.eventId);
  if (!smtp) {
    throw new Error('SMTP configuration for event not found');
  }

  const transportSecurity = resolveTransportSecurity(smtp.security);

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    auth: {
      user: smtp.username,
      pass: decryptSecret(smtp.passwordEncrypted)
    },
    ...transportSecurity
  });

  const verificationUrl = `https://${smtp.slug}/verify?token=${job.payload.verificationToken}`;

  await transporter.sendMail({
    from: `${smtp.fromName} <${smtp.fromEmail}>`,
    to: job.payload.toEmail,
    subject: 'Verify your registration',
    html: `<p>Hello ${job.payload.toName},</p><p>Please verify your registration by clicking this link:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`
  });
}
