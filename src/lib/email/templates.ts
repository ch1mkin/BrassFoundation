export function welcomeEmailHtml({
  name,
  appUrl,
}: {
  name: string;
  appUrl: string;
}) {
  return `
    <div style="font-family: Inter, Arial, sans-serif; color: #1B1B1B; line-height: 1.6; max-width: 560px; margin: 0 auto;">
      <h1 style="font-family: Poppins, Arial, sans-serif; color: #114C88; font-size: 24px;">
        Welcome to Brass Foundation
      </h1>
      <p>Hi ${name || "there"},</p>
      <p>
        Thank you for joining Brass Foundation. Your account is ready —
        explore resources, events, and community programs from your member portal.
      </p>
      <p style="margin: 28px 0;">
        <a href="${appUrl}/member"
           style="background: #11B5C9; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 16px; display: inline-block;">
          Open Member Portal
        </a>
      </p>
      <p style="color: #6B7280; font-size: 14px;">
        Education · Empowerment · Equality
      </p>
    </div>
  `;
}

export function passwordResetEmailHtml({
  name,
  resetUrl,
}: {
  name: string;
  resetUrl: string;
}) {
  return `
    <div style="font-family: Inter, Arial, sans-serif; color: #1B1B1B; line-height: 1.6; max-width: 560px; margin: 0 auto;">
      <h1 style="font-family: Poppins, Arial, sans-serif; color: #114C88; font-size: 24px;">
        Reset your password
      </h1>
      <p>Hi ${name || "there"},</p>
      <p>We received a request to reset your Brass Foundation account password.</p>
      <p style="margin: 28px 0;">
        <a href="${resetUrl}"
           style="background: #11B5C9; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 16px; display: inline-block;">
          Reset Password
        </a>
      </p>
      <p style="color: #6B7280; font-size: 14px;">
        If you did not request this, you can safely ignore this email.
      </p>
    </div>
  `;
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
  return `
    <div style="font-family: Inter, Arial, sans-serif; color: #1B1B1B; line-height: 1.6; max-width: 560px; margin: 0 auto;">
      <h1 style="font-family: Poppins, Arial, sans-serif; color: #006875; font-size: 24px;">
        Application received
      </h1>
      <p>Hi ${name || "there"},</p>
      <p>
        Thank you for applying to Brass Foundation. Our team will review your
        application and follow up by email.
      </p>
      <p style="color: #6B7280; font-size: 14px;">Reference: ${applicationId}</p>
      <p style="margin: 28px 0;">
        <a href="${appUrl}/member"
           style="background: #006875; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 12px; display: inline-block;">
          Open Member Portal
        </a>
      </p>
    </div>
  `;
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
  const when = new Date(startsAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return `
    <div style="font-family: Inter, Arial, sans-serif; color: #1B1B1B; line-height: 1.6; max-width: 560px; margin: 0 auto;">
      <h1 style="font-family: Poppins, Arial, sans-serif; color: #006875; font-size: 24px;">
        You are registered
      </h1>
      <p>Hi ${name || "there"},</p>
      <p>You registered for <strong>${eventTitle}</strong>.</p>
      <p><strong>When:</strong> ${when}</p>
      ${location ? `<p><strong>Where:</strong> ${location}</p>` : ""}
      <p style="margin: 28px 0;">
        <a href="${eventUrl}"
           style="background: #006875; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 12px; display: inline-block;">
          View event
        </a>
      </p>
    </div>
  `;
}

/** Inbox notification for Contact Us submissions (name/email/message must already be escaped). */
export function contactInboxEmailHtml({
  name,
  email,
  messageHtml,
}: {
  name: string;
  email: string;
  messageHtml: string;
}) {
  return `
    <div style="font-family: Inter, Arial, sans-serif; color: #1B1B1B; line-height: 1.6; max-width: 560px; margin: 0 auto;">
      <h1 style="font-family: Poppins, Arial, sans-serif; color: #114C88; font-size: 22px;">
        New contact message
      </h1>
      <p><strong>From:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
      <p style="white-space: pre-wrap;">${messageHtml}</p>
    </div>
  `;
}

/** Auto-reply to the person who submitted Contact Us (name must already be escaped). */
export function contactAutoReplyEmailHtml({ name }: { name: string }) {
  return `
    <div style="font-family: Inter, Arial, sans-serif; color: #1B1B1B; line-height: 1.6; max-width: 560px; margin: 0 auto;">
      <h1 style="font-family: Poppins, Arial, sans-serif; color: #114C88; font-size: 22px;">
        We received your message
      </h1>
      <p>Hi ${name || "there"},</p>
      <p>
        Thank you for contacting Brass Foundation. Our team has received your
        message and will get back to you as soon as we can.
      </p>
      <p style="color: #6B7280; font-size: 14px;">
        Education · Empowerment · Equality
      </p>
    </div>
  `;
}
