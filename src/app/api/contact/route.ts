import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSmtpConfigured, sendEmail } from "@/lib/email/smtp";

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().optional().or(z.literal("")),
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

    const { name, message } = parsed.data;
    const email =
      parsed.data.email?.trim() || "not-provided@brassfoundation.local";

    try {
      const supabase = await createClient();
      await supabase.from("contact_messages").insert({
        name,
        email,
        message,
        form_type: "contact",
      });
    } catch {
      // Table may not exist yet — continue to email attempt
    }

    if (!isSmtpConfigured()) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        message:
          "Thanks — your message was saved. Email delivery is not configured yet, so we will follow up once SMTP is set.",
      });
    }

    const inbox = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER!;
    const result = await sendEmail({
      to: inbox,
      replyTo: email.includes("not-provided@") ? undefined : email,
      subject: `Contact form — ${name}`,
      html: `
        <p><strong>From:</strong> ${name}${
          email.includes("not-provided@") ? "" : ` (${email})`
        }</p>
        <p>${message.replace(/\n/g, "<br/>")}</p>
      `,
    });

    return NextResponse.json({
      ok: result.sent,
      message: "Thank you. We will get back to you soon.",
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send email.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
