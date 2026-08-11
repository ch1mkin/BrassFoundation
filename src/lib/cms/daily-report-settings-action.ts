"use server";

import { z } from "zod";
import { getUserContext, canAccessAdmin } from "@/lib/auth/session";
import {
  DAILY_REPORT_EMAIL_KEY,
  setSiteSetting,
} from "@/lib/cms/site-settings";

export type DailyReportEmailState = {
  error?: string;
  success?: string;
};

const schema = z.object({
  email: z.string().email("Enter a valid Gmail / email address."),
});

export async function saveDailyReportEmailAction(
  _prev: DailyReportEmailState,
  formData: FormData,
): Promise<DailyReportEmailState> {
  try {
    const context = await getUserContext();
    if (!context || !canAccessAdmin(context)) {
      return { error: "Unauthorized." };
    }

    const parsed = schema.safeParse({
      email: String(formData.get("email") || "")
        .trim()
        .toLowerCase(),
    });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Invalid email." };
    }

    await setSiteSetting(
      DAILY_REPORT_EMAIL_KEY,
      { email: parsed.data.email },
      context.userId,
    );

    return {
      success: `Daily PDF report will be sent to ${parsed.data.email} at 12:00 AM IST.`,
    };
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "Could not save setting.",
    };
  }
}
