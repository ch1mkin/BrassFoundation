import { createServiceClient } from "@/lib/supabase/admin";

export const DAILY_REPORT_EMAIL_KEY = "daily_membership_report_email";

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

export async function getDailyReportEmail(): Promise<string | null> {
  const value = await getSiteSetting<{ email?: string } | string>(
    DAILY_REPORT_EMAIL_KEY,
  );
  if (!value) return null;
  if (typeof value === "string") return value.trim() || null;
  return value.email?.trim() || null;
}
