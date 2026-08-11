import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

export function isSmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      (process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER),
  );
}

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP is not configured.");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE !== "false",
    auth: { user, pass },
  });

  return transporter;
}

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }[];
};

export type SendEmailResult =
  | { sent: true; messageId?: string }
  | { sent: false; skipped: true; reason: string };

/**
 * Sends email via Hostinger SMTP when configured.
 * Silently no-ops when SMTP credentials are missing (safe during setup).
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
  attachments,
}: SendEmailInput): Promise<SendEmailResult> {
  if (!isSmtpConfigured()) {
    if (process.env.NODE_ENV === "development") {
      console.info("[email] Skipped — SMTP not configured yet.", { to, subject });
    }
    return {
      sent: false,
      skipped: true,
      reason: "SMTP is not configured yet.",
    };
  }

  const fromName = process.env.SMTP_FROM_NAME || "BRASS Foundation";
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER!;
  const mailer = getTransporter();

  const info = await mailer.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: Array.isArray(to) ? to.join(", ") : to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, " "),
    replyTo,
    attachments,
  });

  return { sent: true, messageId: info.messageId };
}

export async function verifySmtpConnection() {
  if (!isSmtpConfigured()) {
    return false;
  }
  const mailer = getTransporter();
  await mailer.verify();
  return true;
}
