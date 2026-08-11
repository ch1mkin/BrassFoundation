import { createServiceClient } from "@/lib/supabase/admin";

export const DAILY_REPORT_EMAIL_KEY = "daily_membership_report_email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function getSiteSetting<T = unknown>(
  key: string,
): Promise<T | null> {
  const admin = createServiceClient();
  const { data } = await admin
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (!data?.value) return null;
  return data.value as T;
}

export async function setSiteSetting(
  key: string,
  value: unknown,
  updatedBy?: string | null,
) {
  const admin = createServiceClient();
  const { data: existing } = await admin
    .from("site_settings")
    .select("id")
    .eq("key", key)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await admin
      .from("site_settings")
      .update({
        value,
        updated_by: updatedBy || null,
      })
      .eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await admin.from("site_settings").insert({
    key,
    value,
    updated_by: updatedBy || null,
  });
  if (error) throw error;
}

/** Split a comma/semicolon-separated email list into unique valid addresses. */
export function parseEmailList(input: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of String(input || "").split(/[,;]+/)) {
    const email = part.trim().toLowerCase();
    if (!email || seen.has(email)) continue;
    if (!EMAIL_RE.test(email)) continue;
    seen.add(email);
    out.push(email);
  }
  return out;
}

export function validateEmailListInput(input: string): {
  emails: string[];
  error?: string;
} {
  const raw = String(input || "").trim();
  if (!raw) return { emails: [], error: "Enter at least one email address." };

  const parts = raw.split(/[,;]+/).map((p) => p.trim()).filter(Boolean);
  const invalid = parts.filter((p) => !EMAIL_RE.test(p.toLowerCase()));
  if (invalid.length) {
    return {
      emails: [],
      error: `Invalid email${invalid.length > 1 ? "s" : ""}: ${invalid.join(", ")}`,
    };
  }

  const emails = parseEmailList(raw);
  if (!emails.length) {
    return { emails: [], error: "Enter at least one valid email address." };
  }
  return { emails };
}

/**
 * Daily report recipients (supports legacy single string / { email } and
 * multi-recipient { emails: string[] }).
 */
export async function getDailyReportEmails(): Promise<string[]> {
  const value = await getSiteSetting<
    { email?: string; emails?: string[] } | string
  >(DAILY_REPORT_EMAIL_KEY);
  if (!value) return [];
  if (typeof value === "string") return parseEmailList(value);
  if (Array.isArray(value.emails) && value.emails.length) {
    return parseEmailList(value.emails.join(","));
  }
  if (value.email) return parseEmailList(value.email);
  return [];
}

/** @deprecated Prefer getDailyReportEmails(); kept for display compatibility. */
export async function getDailyReportEmail(): Promise<string | null> {
  const emails = await getDailyReportEmails();
  return emails.length ? emails.join(", ") : null;
}
