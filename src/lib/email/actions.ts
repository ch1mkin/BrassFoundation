"use server";

import { getUserContext, canAccessAdmin } from "@/lib/auth/session";
import { isSmtpConfigured, sendEmail } from "@/lib/email/smtp";
import {
  membershipWelcomeEmailHtml,
  smtpTestEmailHtml,
} from "@/lib/email/templates";

export type MailActionState = {
  error?: string;
  success?: string;
};

export async function sendSmtpTestEmailAction(
  _prev: MailActionState,
  formData: FormData,
): Promise<MailActionState> {
  const context = await getUserContext();
  if (!context || !canAccessAdmin(context)) {
    return { error: "Unauthorized." };
  }

  if (!isSmtpConfigured()) {
    return {
      error:
        "SMTP is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS, and SMTP_FROM_EMAIL in Vercel / .env.",
    };
  }

  const to =
    String(formData.get("to") || "").trim().toLowerCase() ||
    context.email ||
    "";
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return { error: "Enter a valid email address to send the test." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const result = await sendEmail({
    to,
    subject: "Brass Foundation — SMTP test",
    html: smtpTestEmailHtml({
      adminName: context.profile?.full_name || context.email,
      appUrl,
    }),
    text: `Hi ${context.profile?.full_name || "Admin"},\n\nThis is a test email from Brass Foundation. SMTP is working.\n\nOpen settings: ${appUrl}/admin/settings`,
  });

  if (!result.sent) {
    return {
      error:
        "skipped" in result
          ? result.reason
          : "Could not send the test email. Check SMTP credentials.",
    };
  }

  return { success: `Test email sent to ${to}.` };
}

export async function sendMembershipWelcomeEmail(input: {
  to: string;
  name: string;
  membershipId?: string | null;
}) {
  if (!input.to) return;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  try {
    await sendEmail({
      to: input.to,
      subject: "Welcome to Brass Foundation — thank you for joining",
      html: membershipWelcomeEmailHtml({
        name: input.name,
        membershipId: input.membershipId,
        appUrl,
      }),
      text: `Dear ${input.name},\n\nThank you for joining Brass Foundation. Your membership payment was successful.\n\nContribute: ${appUrl}/member/payments\nMember panel: ${appUrl}/member\n${input.membershipId ? `Membership ID: ${input.membershipId}\n` : ""}\nWith gratitude,\nTeam Brass Foundation`,
    });
  } catch (err) {
    console.error("[email] Welcome email failed:", err);
  }
}
