import { NextResponse } from "next/server";
import { getDailyReportEmails } from "@/lib/cms/site-settings";
import { isSmtpConfigured, sendEmail } from "@/lib/email/smtp";
import { membershipReportEmailHtml } from "@/lib/email/templates";
import {
  buildMembershipReportPdf,
  fetchMembershipRows,
  istDayWindow,
} from "@/lib/reports/membership-daily-report";
import { SITE } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorize(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  const url = new URL(request.url);
  return url.searchParams.get("secret") === secret;
}

async function runDailyReport() {
  const recipients = await getDailyReportEmails();
  if (!recipients.length) {
    return {
      ok: false,
      skipped: true,
      reason: "Daily report email is not configured in admin settings.",
    };
  }
  if (!isSmtpConfigured()) {
    return { ok: false, skipped: true, reason: "SMTP is not configured." };
  }

  const window = istDayWindow();
  const rows = await fetchMembershipRows({
    from: window.from,
    to: window.to,
  });
  const generatedAt = new Date();
  const pdf = await buildMembershipReportPdf({
    rows,
    generatedAt,
    periodLabel: window.label,
  });

  const subject = `${SITE.name} daily membership report — ${window.label}`;
  const html = membershipReportEmailHtml({
    periodLabel: window.label,
    rowCount: rows.length,
    generatedAt,
    variant: "daily",
  });
  const text = `Daily membership report for ${window.label}.\nRegistrations: ${rows.length}\nGenerated: ${generatedAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST\n\nPlease check out the attached Report.\n\nTeam ${SITE.name}`;

  const result = await sendEmail({
    to: recipients,
    subject,
    html,
    text,
    attachments: [
      {
        filename: `membership-report-${window.label}.pdf`,
        content: pdf,
        contentType: "application/pdf",
      },
    ],
  });

  if (!result.sent) {
    return {
      ok: false,
      reason: "skipped" in result ? result.reason : "Send failed",
    };
  }

  return {
    ok: true,
    to: recipients,
    period: window.label,
    count: rows.length,
    messageId: result.messageId,
  };
}

export async function GET(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await runDailyReport();
    return NextResponse.json(result, { status: result.ok ? 200 : 200 });
  } catch (err) {
    console.error("[cron] daily report failed", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Report failed",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
