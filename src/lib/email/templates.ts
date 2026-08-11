import { escapeHtml } from "@/lib/security/html";

function appBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

function logoUrl() {
  return `${appBaseUrl()}/brand/logo.png`;
}

/** Format dates/times for emails in Indian Standard Time. */
function formatIndianDateTime(
  value: Date | string | number = new Date(),
  options?: Intl.DateTimeFormatOptions,
) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
    ...options,
  });
}

/** Shared branded shell for all transactional emails. */
export function brandedEmailLayout({
  title,
  preheader,
  bodyHtml,
}: {
  title: string;
  preheader?: string;
  bodyHtml: string;
}) {
  const safeTitle = escapeHtml(title);
  const safePreheader = escapeHtml(preheader || title);
  const logo = logoUrl();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background:#F4F6F8;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    ${safePreheader}
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F4F6F8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 40px rgba(0,43,91,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#002B5B 0%,#006875 55%,#11B5C9 100%);padding:28px 32px;text-align:center;">
              <img src="${logo}" alt="BRASS Foundation" width="72" height="72" style="display:inline-block;border-radius:999px;background:#ffffff;padding:8px;box-sizing:content-box;" />
              <p style="margin:14px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.02em;">
                BRASS Foundation
              </p>
              <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:rgba(255,255,255,0.88);letter-spacing:0.08em;text-transform:uppercase;">
                Knowledge to Prosperity
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px 8px;font-family:Arial,Helvetica,sans-serif;color:#14181F;line-height:1.65;font-size:15px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;font-family:Arial,Helvetica,sans-serif;">
              <hr style="border:none;border-top:1px solid #E8ECF0;margin:8px 0 20px;" />
              <p style="margin:0;font-size:12px;line-height:1.5;color:#5C6670;text-align:center;">
                BRASS Foundation · Knowledge to Prosperity<br />
                This is an automated message. Please do not reply directly unless a reply address is provided.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(href: string, label: string) {
  return `<p style="margin:28px 0 8px;text-align:center;">
    <a href="${href}"
       style="background:#002B5B;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:12px;display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;">
      ${escapeHtml(label)}
    </a>
  </p>`;
}

/** Sent after ₹10 membership payment succeeds. */
export function membershipWelcomeEmailHtml({
  name,
  membershipId,
  appUrl,
}: {
  name: string;
  membershipId?: string | null;
  appUrl?: string;
}) {
  const base = (appUrl || appBaseUrl()).replace(/\/$/, "");
  const safeName = escapeHtml(name || "Friend");
  const portalUrl = `${base}/member`;
  const contributeUrl = `${base}/membership`;
  const idLine = membershipId
    ? `<p style="margin:16px 0;padding:12px 14px;background:#F4F6F8;border-radius:12px;font-size:14px;color:#002B5B;">
        <strong>Membership ID:</strong> ${escapeHtml(membershipId)}
      </p>`
    : "";

  const body = `
    <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.25;color:#002B5B;">
      Welcome to BRASS Foundation
    </h1>
    <p style="margin:0 0 14px;">Dear ${safeName},</p>
    <p style="margin:0 0 14px;">
      Thank you for joining <strong>BRASS Foundation</strong>. Your membership payment was successful,
      and we are delighted to welcome you into our community dedicated to education, empowerment, and equality.
    </p>
    <p style="margin:0 0 14px;">
      Your support strengthens our shared mission. We invite you to contribute further to the Foundation
      whenever you can — even a small monthly contribution helps expand study centres, mentoring, and outreach.
    </p>
    ${idLine}
    ${ctaButton(contributeUrl, "Contribute to the Foundation")}
    <p style="margin:18px 0 0;text-align:center;font-size:13px;color:#5C6670;">
      Or open your
      <a href="${portalUrl}" style="color:#006875;font-weight:700;text-decoration:none;">Member Panel</a>
      to manage your membership, referral link, and family members.
    </p>
    <p style="margin:24px 0 0;">
      With gratitude,<br />
      <strong>Team BRASS Foundation</strong>
    </p>
  `;

  return brandedEmailLayout({
    title: "Welcome to BRASS Foundation",
    preheader: `Thank you for joining, ${name || "friend"}. Contribute from your member panel.`,
    bodyHtml: body,
  });
}

/** @deprecated Prefer membershipWelcomeEmailHtml for paid joins. */
export function welcomeEmailHtml({
  name,
  appUrl,
}: {
  name: string;
  appUrl: string;
}) {
  return membershipWelcomeEmailHtml({ name, appUrl });
}

export function passwordResetEmailHtml({
  name,
  resetUrl,
}: {
  name: string;
  resetUrl: string;
}) {
  const safeName = escapeHtml(name || "there");
  const body = `
    <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#002B5B;">
      Reset your password
    </h1>
    <p>Hi ${safeName},</p>
    <p>
      We received a request to reset your BRASS Foundation account password.
      Click the button below to choose a new password. This link expires in about
      one hour and can be used once.
    </p>
    ${ctaButton(resetUrl, "Reset Password")}
    <p style="font-size:13px;color:#5C6670;word-break:break-all;">
      If the button does not work, copy and paste this link into your browser:<br />
      <a href="${escapeHtml(resetUrl)}" style="color:#006875;">${escapeHtml(resetUrl)}</a>
    </p>
    <p style="font-size:13px;color:#5C6670;">
      If you did not request a password reset, you can safely ignore this email.
      Your password will stay the same.
    </p>
  `;
  return brandedEmailLayout({
    title: "Reset your password",
    preheader: "Reset your BRASS Foundation password securely.",
    bodyHtml: body,
  });
}

export function membershipReceivedEmailHtml({
  name,
  appUrl,
  applicationId,
}: {
  name: string;
  appUrl: string;
  applicationId: string;
}) {
  const safeName = escapeHtml(name || "there");
  const body = `
    <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#006875;">
      Application received
    </h1>
    <p>Hi ${safeName},</p>
    <p>
      Thank you for applying to BRASS Foundation. Please complete payment if you have not already,
      so we can activate your membership.
    </p>
    <p style="font-size:13px;color:#5C6670;">Reference: ${escapeHtml(applicationId)}</p>
    ${ctaButton(`${appUrl.replace(/\/$/, "")}/member`, "Open Member Portal")}
  `;
  return brandedEmailLayout({
    title: "Application received",
    bodyHtml: body,
  });
}

export function eventRegistrationEmailHtml({
  name,
  eventTitle,
  eventUrl,
  startsAt,
  location,
}: {
  name: string;
  eventTitle: string;
  eventUrl: string;
  startsAt: string;
  location: string | null;
}) {
  const when = `${formatIndianDateTime(startsAt)} IST`;
  const safeName = escapeHtml(name || "there");
  const body = `
    <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#006875;">
      You are registered
    </h1>
    <p>Hi ${safeName},</p>
    <p>You registered for <strong>${escapeHtml(eventTitle)}</strong>.</p>
    <p><strong>When:</strong> ${escapeHtml(when)}</p>
    ${location ? `<p><strong>Where:</strong> ${escapeHtml(location)}</p>` : ""}
    ${ctaButton(eventUrl, "View event")}
  `;
  return brandedEmailLayout({
    title: "Event registration",
    bodyHtml: body,
  });
}

export function contactInboxEmailHtml({
  name,
  email,
  messageHtml,
}: {
  name: string;
  email: string;
  messageHtml: string;
}) {
  const body = `
    <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#114C88;">
      New contact message
    </h1>
    <p><strong>From:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <hr style="border:none;border-top:1px solid #E5E7EB;margin:20px 0;" />
    <p style="white-space:pre-wrap;">${messageHtml}</p>
  `;
  return brandedEmailLayout({
    title: "New contact message",
    bodyHtml: body,
  });
}

export function contactAutoReplyEmailHtml({ name }: { name: string }) {
  const safeName = escapeHtml(name || "there");
  const body = `
    <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#114C88;">
      We received your message
    </h1>
    <p>Hi ${safeName},</p>
    <p>
      Thank you for contacting BRASS Foundation. Our team has received your
      message and will get back to you as soon as we can.
    </p>
  `;
  return brandedEmailLayout({
    title: "We received your message",
    bodyHtml: body,
  });
}

/** Admin SMTP test email. */
export function smtpTestEmailHtml({
  adminName,
  appUrl,
}: {
  adminName?: string | null;
  appUrl?: string;
}) {
  const base = (appUrl || appBaseUrl()).replace(/\/$/, "");
  const safeName = escapeHtml(adminName || "Admin");
  const body = `
    <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#002B5B;">
      SMTP test successful
    </h1>
    <p>Hi ${safeName},</p>
    <p>
      This is a test email from the BRASS Foundation admin panel.
      If you received it, Hostinger SMTP is configured correctly.
    </p>
    ${ctaButton(`${base}/admin/settings`, "Back to Settings")}
    <p style="font-size:12px;color:#5C6670;">Sent at ${escapeHtml(`${formatIndianDateTime(new Date())} IST`)}</p>
  `;
  return brandedEmailLayout({
    title: "SMTP test successful",
    preheader: "BRASS Foundation email delivery is working.",
    bodyHtml: body,
  });
}

/** Branded membership PDF report email (manual share or daily cron). */
export function membershipReportEmailHtml({
  periodLabel,
  rowCount,
  generatedAt,
  variant = "share",
}: {
  periodLabel: string;
  rowCount: number;
  generatedAt?: Date | string;
  variant?: "share" | "daily";
}) {
  const when = formatIndianDateTime(generatedAt || new Date());
  const safePeriod = escapeHtml(periodLabel);
  const isDaily = variant === "daily";
  const headline = isDaily
    ? "Daily membership report"
    : "Membership report ready";
  const intro = isDaily
    ? `Please find attached the automatic daily membership registration PDF for <strong>${safePeriod}</strong> (IST day ending at midnight).`
    : `Please find attached the BRASS Foundation membership registration PDF for the selected period <strong>${safePeriod}</strong>.`;

  const body = `
    <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.25;color:#002B5B;">
      ${headline}
    </h1>
    <p style="margin:0 0 14px;">Dear colleague,</p>
    <p style="margin:0 0 14px;">
      ${intro}
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;margin:18px 0;border-collapse:separate;border-spacing:0;background:#F4F6F8;border-radius:14px;overflow:hidden;">
      <tr>
        <td style="padding:14px 16px;font-size:13px;color:#5C6670;border-bottom:1px solid #E8ECF0;">Period</td>
        <td style="padding:14px 16px;font-size:14px;font-weight:700;color:#002B5B;text-align:right;border-bottom:1px solid #E8ECF0;">${safePeriod}</td>
      </tr>
      <tr>
        <td style="padding:14px 16px;font-size:13px;color:#5C6670;border-bottom:1px solid #E8ECF0;">Registrations listed</td>
        <td style="padding:14px 16px;font-size:14px;font-weight:700;color:#002B5B;text-align:right;border-bottom:1px solid #E8ECF0;">${escapeHtml(String(rowCount))}</td>
      </tr>
      <tr>
        <td style="padding:14px 16px;font-size:13px;color:#5C6670;">Generated</td>
        <td style="padding:14px 16px;font-size:14px;font-weight:700;color:#002B5B;text-align:right;">${escapeHtml(when)} IST</td>
      </tr>
    </table>
    <p style="margin:0 0 14px;">
      Please check out the <strong>attached report</strong> for the full tabular list of members (name, age, gender, membership ID, status, and registration time).
    </p>
    <p style="margin:18px 0 0;padding:14px 16px;background:#F4F6F8;border-radius:12px;font-size:14px;color:#002B5B;text-align:center;font-weight:700;">
      Check out the attached Report
    </p>
    <p style="margin:24px 0 0;">
      With gratitude,<br />
      <strong>Team BRASS Foundation</strong>
    </p>
  `;

  return brandedEmailLayout({
    title: isDaily
      ? `Daily membership report — ${periodLabel}`
      : `Membership report — ${periodLabel}`,
    preheader: `PDF membership report · ${rowCount} registration${rowCount === 1 ? "" : "s"} · ${periodLabel}`,
    bodyHtml: body,
  });
}

