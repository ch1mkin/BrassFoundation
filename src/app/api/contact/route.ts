import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  contactAutoReplyEmailHtml,
  contactInboxEmailHtml,
} from "@/lib/email/templates";
import { isSmtpConfigured, sendEmail } from "@/lib/email/smtp";
import { escapeHtml } from "@/lib/security/html";
import {
  clientIpFromRequest,
  rateLimit,
} from "@/lib/security/rate-limit";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(1).max(5000),
  /** Honeypot — bots fill this; humans leave it empty. */
  website: z.string().max(200).optional().or(z.literal("")),
});

function contactInbox() {
  return (
    process.env.CONTACT_INBOX?.trim() ||
    process.env.SMTP_FROM_EMAIL?.trim() ||
    process.env.SMTP_USER?.trim() ||
    ""
  );
}

export async function POST(request: Request) {
  try {
    const ip = clientIpFromRequest(request);
    const limited = rateLimit({
      namespace: "contact",
      key: ip,
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!limited.ok) {
      return NextResponse.json(
        {
          error: "Too many messages. Please wait a few minutes and try again.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        },
      );
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please provide your name, a valid email, and a message." },
        { status: 400 },
      );
    }

    // Silent success for honeypot hits — do not tip off bots.
    if (parsed.data.website && parsed.data.website.trim().length > 0) {
      return NextResponse.json({
        ok: true,
        message: "Thank you. We will get back to you soon.",
      });
    }

    const { name, email, message } = parsed.data;
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");

    const supabase = await createClient();
    const { error: insertError } = await supabase
      .from("contact_messages")
      .insert({
        name,
        email,
        message,
        form_type: "contact",
      });

    if (insertError) {
      console.error("[contact] Failed to save message:", insertError.message);
      // Still try email so the inbox gets it even if DB insert fails.
    }

    if (!isSmtpConfigured()) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        saved: !insertError,
        message: insertError
          ? "Thanks — we could not deliver email yet. Please try again later or email us directly."
          : "Thanks — your message was saved. Email delivery is not configured yet, so we will follow up once SMTP is set.",
      });
    }

    const inbox = contactInbox();
    if (!inbox) {
      return NextResponse.json(
        {
          error:
            "Contact inbox is not configured. Set CONTACT_INBOX or SMTP_FROM_EMAIL.",
        },
        { status: 500 },
      );
    }

    const result = await sendEmail({
      to: inbox,
      replyTo: email,
      subject: `Contact form — ${name}`,
      html: contactInboxEmailHtml({
        name: safeName,
        email: safeEmail,
        messageHtml: safeMessage,
      }),
      text: `From: ${name} (${email})\n\n${message}`,
    });

    if (!result.sent) {
      return NextResponse.json(
        {
          error:
            "skipped" in result
              ? result.reason
              : "Could not send your message. Please try again later.",
          saved: !insertError,
        },
        { status: 502 },
      );
    }

    // Best-effort auto-reply — never fail the request if this fails.
    try {
      await sendEmail({
        to: email,
        subject: "We received your message — Brass Foundation",
        html: contactAutoReplyEmailHtml({ name: safeName }),
        text: `Hi ${name},\n\nThank you for contacting Brass Foundation. We received your message and will get back to you soon.\n\nEducation · Empowerment · Equality`,
      });
    } catch (autoReplyError) {
      console.error("[contact] Auto-reply failed:", autoReplyError);
    }

    return NextResponse.json({
      ok: true,
      message: "Thank you. We will get back to you soon.",
      saved: !insertError,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send email.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
