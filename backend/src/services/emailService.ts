import nodemailer from 'nodemailer';
import { env } from '../config/env';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendViaSmtp(payload: EmailPayload): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_SMTP_PORT || '587', 10),
    secure: process.env.EMAIL_SMTP_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_SMTP_USER,
      pass: env.emailApiKey,
    },
  });

  await transporter.sendMail({
    from: env.emailFrom,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  if (env.emailProvider === 'console' || env.nodeEnv === 'development') {
    console.log('\n[email] ───────────────────────────────────────');
    console.log(`[email] To: ${payload.to}`);
    console.log(`[email] Subject: ${payload.subject}`);
    console.log(`[email] Body:\n${payload.text || payload.html}`);
    console.log('[email] ───────────────────────────────────────\n');
    return;
  }

  if (env.emailProvider === 'smtp') {
    await sendViaSmtp(payload);
    return;
  }

  console.warn(`[email] Unknown provider "${env.emailProvider}" — logging to console instead.`);
  console.log(payload.text || payload.html);
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verifyUrl = `${env.clientUrl}/verify-email?token=${encodeURIComponent(token)}`;
  await sendEmail({
    to: email,
    subject: 'Verify your GRACE AI account',
    text: `Verify your email: ${verifyUrl}`,
    html: `<p>Welcome to GRACE AI.</p><p><a href="${verifyUrl}">Verify your email address</a></p><p>This link expires in 24 hours.</p>`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${env.clientUrl}/reset-password?token=${encodeURIComponent(token)}`;
  await sendEmail({
    to: email,
    subject: 'Reset your GRACE AI password',
    text: `Reset your password: ${resetUrl}`,
    html: `<p>You requested a password reset.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 1 hour. If you did not request this, ignore this email.</p>`,
  });
}
