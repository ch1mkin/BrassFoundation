"use server";

import { z } from "zod";
import { getUserContext, canAccessAdmin } from "@/lib/auth/session";
import { isSmtpConfigured, sendEmail } from "@/lib/email/smtp";
import { membershipReportEmailHtml } from "@/lib/email/templates";
import {
  buildMembershipReportPdf,
  fetchMembershipRows,
} from "@/lib/reports/membership-daily-report";
import { SITE } from "@/lib/constants";

export type ShareReportState = {
  error?: string;
  success?: string;
};

const schema = z.object({
  email: z.string().email("Enter a valid email."),
  from: z.string().optional(),
  to: z.string().optional(),
});

export async function shareMembershipReportAction(
  _prev: ShareReportState,
  formData: FormData,
): Promise<ShareReportState> {
  try {
    const context = await getUserContext();
    if (!context || !canAccessAdmin(context)) {
      return { error: "Unauthorized." };
    }
    if (!isSmtpConfigured()) {
      return { error: "SMTP is not configured." };
    }

    const parsed = schema.safeParse({
      email: String(formData.get("email") || "")
        .trim()
        .toLowerCase(),
      from: String(formData.get("from") || "").trim() || undefined,
      to: String(formData.get("to") || "").trim() || undefined,
    });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Invalid input." };
    }

    const from = parsed.data.from ? new Date(parsed.data.from) : undefined;
    const to = parsed.data.to
      ? (() => {
          const d = new Date(parsed.data.to!);
          d.setHours(23, 59, 59, 999);
          return d;
        })()
      : undefined;

    const rows = await fetchMembershipRows({ from, to });
    const generatedAt = new Date();
    const periodLabel =
      from || to
        ? `${parsed.data.from || "start"} → ${parsed.data.to || "now"}`
        : "all registrations";

    const pdf = await buildMembershipReportPdf({
      rows,
      generatedAt,
      periodLabel,
    });

    const html = membershipReportEmailHtml({
      periodLabel,
      rowCount: rows.length,
      generatedAt,
      variant: "share",
    });
    const text = `Dear colleague,\n\nPlease find attached the ${SITE.name} membership registration PDF for ${periodLabel}.\nRegistrations listed: ${rows.length}\nGenerated: ${generatedAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST\n\nPlease check out the attached Report.\n\nTeam ${SITE.name}`;

    const result = await sendEmail({
      to: parsed.data.email,
      subject: `${SITE.name} membership report — ${periodLabel}`,
      html,
      text,
      attachments: [
        {
          filename: `membership-report-${generatedAt.toISOString().slice(0, 10)}.pdf`,
          content: pdf,
          contentType: "application/pdf",
        },
      ],
    });

    if (!result.sent) {
      return {
        error: "skipped" in result ? result.reason : "Could not send email.",
      };
    }

    return {
      success: `PDF report (${rows.length} members) sent to ${parsed.data.email}.`,
    };
  } catch (err) {
    console.error("[share-membership-report]", err);
    return {
      error:
        err instanceof Error
          ? err.message
          : "Could not send membership report.",
    };
  }
}
