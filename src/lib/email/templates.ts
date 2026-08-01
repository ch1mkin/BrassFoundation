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
