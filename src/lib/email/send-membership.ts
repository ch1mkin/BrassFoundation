import { isSmtpConfigured, sendEmail } from "@/lib/email/smtp";
import { membershipWelcomeEmailHtml } from "@/lib/email/templates";

export type WelcomeEmailResult =
  | { sent: true }
  | { sent: false; reason: string };

/** Transactional welcome mail after ₹10 membership payment succeeds. */
export async function sendMembershipWelcomeEmail(input: {
  to: string;
  name: string;
  membershipId?: string | null;
}): Promise<WelcomeEmailResult> {
  const to = String(input.to || "")
    .trim()
    .toLowerCase();
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return { sent: false, reason: "Missing or invalid recipient email." };
  }

  if (!isSmtpConfigured()) {
    const reason = "SMTP is not configured.";
    console.error("[email] Welcome email skipped:", reason);
    return { sent: false, reason };
  }

  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ).replace(/\/$/, "");
  const name = input.name?.trim() || "Friend";
  const html = membershipWelcomeEmailHtml({
    name,
    membershipId: input.membershipId,
    appUrl,
  });
  const text = `Dear ${name},\n\nThank you for joining BRASS Foundation. Your membership payment was successful.\n\nContribute (monthly mandate): ${appUrl}/membership\nMember panel: ${appUrl}/member\n${input.membershipId ? `Membership ID: ${input.membershipId}\n` : ""}\nWith gratitude,\nTeam BRASS Foundation`;

  const attempt = async () =>
    sendEmail({
      to,
      subject: "Welcome to BRASS Foundation — thank you for joining",
      html,
      text,
    });

  try {
    let result = await attempt();
    if (!result.sent) {
      // Brief retry — Hostinger SMTP occasionally flakes.
      await new Promise((r) => setTimeout(r, 700));
      result = await attempt();
    }
    if (!result.sent) {
      const reason =
        "skipped" in result ? result.reason : "SMTP send returned failure.";
      console.error("[email] Welcome email failed:", reason, { to });
      return { sent: false, reason };
    }
    return { sent: true };
  } catch (err) {
    console.error("[email] Welcome email threw:", err);
    try {
      await new Promise((r) => setTimeout(r, 700));
      const result = await attempt();
      if (result.sent) return { sent: true };
    } catch (retryErr) {
      console.error("[email] Welcome email retry threw:", retryErr);
    }
    return {
      sent: false,
      reason: err instanceof Error ? err.message : "Email send failed.",
    };
  }
}
