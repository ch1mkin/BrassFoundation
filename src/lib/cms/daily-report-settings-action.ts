"use server";

import { getUserContext, canAccessAdmin } from "@/lib/auth/session";
import {
  DAILY_REPORT_EMAIL_KEY,
  setSiteSetting,
  validateEmailListInput,
} from "@/lib/cms/site-settings";

export type DailyReportEmailState = {
  error?: string;
  success?: string;
};

export async function saveDailyReportEmailAction(
  _prev: DailyReportEmailState,
  formData: FormData,
): Promise<DailyReportEmailState> {
  try {
    const context = await getUserContext();
    if (!context || !canAccessAdmin(context)) {
      return { error: "Unauthorized." };
    }

    const raw = String(formData.get("email") || "").trim();
    const { emails, error } = validateEmailListInput(raw);
    if (error || !emails.length) {
      return { error: error || "Enter at least one valid email." };
    }

    await setSiteSetting(
      DAILY_REPORT_EMAIL_KEY,
      { emails, email: emails[0] },
      context.userId,
    );

    const list =
      emails.length === 1
        ? emails[0]
        : `${emails.length} addresses (${emails.join(", ")})`;

    return {
      success: `Daily PDF report will be sent to ${list} at 12:00 AM IST.`,
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Could not save setting.",
    };
  }
}
