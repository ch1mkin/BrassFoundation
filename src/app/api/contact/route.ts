import { NextResponse } from "next/server";
import { z } from "zod";
import { isSmtpConfigured, sendEmail } from "@/lib/email/smtp";

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid contact form data." },
        { status: 400 },
      );
    }

    if (!isSmtpConfigured()) {
      return NextResponse.json({
        ok: false,
        skipped: true,
        message:
          "Thanks — email delivery is not configured yet. Please try again later or email us directly.",
      });
    }

    const { name, email, message } = parsed.data;
    const inbox = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER!;

    const result = await sendEmail({
      to: inbox,
      replyTo: email,
      subject: `Contact form — ${name}`,
      html: `
        <p><strong>From:</strong> ${name} (${email})</p>
        <p>${message.replace(/\n/g, "<br/>")}</p>
      `,
    });

    return NextResponse.json({ ok: result.sent, ...result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send email.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
