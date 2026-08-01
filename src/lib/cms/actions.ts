"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canAccessAdmin, getUserContext } from "@/lib/auth/session";

export type CmsActionState = {
  error?: string;
  success?: string;
};

const OPTIONAL_COLUMNS = [
  "hero_background_url",
  "hero_background_mobile_url",
  "hero_eyebrow_pa",
  "hero_headline_pa",
  "hero_subheadline_pa",
  "hero_cta_primary_label_pa",
  "hero_cta_secondary_label_pa",
  "about_eyebrow_pa",
  "about_headline_pa",
  "about_body_pa",
  "membership_headline_pa",
  "membership_body_pa",
] as const;

function isMissingColumnError(message: string) {
  return (
    /column .* does not exist/i.test(message) ||
    /could not find the .* column/i.test(message) ||
    /schema cache/i.test(message)
  );
}

export async function updateHomepageAction(
  _prev: CmsActionState,
  formData: FormData,
): Promise<CmsActionState> {
  try {
    const context = await getUserContext();
    if (!context || !canAccessAdmin(context)) {
      return { error: "Unauthorized." };
    }

    const statsRaw = String(formData.get("stats_json") || "").trim();
    let stats: unknown = undefined;
    if (statsRaw) {
      try {
        stats = JSON.parse(statsRaw);
      } catch {
        return { error: "Invalid stats JSON." };
      }
    }

    const payload: Record<string, unknown> = {
      hero_eyebrow: String(formData.get("hero_eyebrow") || "").trim(),
      hero_headline: String(formData.get("hero_headline") || "").trim(),
      hero_subheadline: String(formData.get("hero_subheadline") || "").trim(),
      hero_cta_primary_label: String(
        formData.get("hero_cta_primary_label") || "",
      ).trim(),
      hero_cta_primary_href: String(
        formData.get("hero_cta_primary_href") || "",
      ).trim(),
      hero_cta_secondary_label: String(
        formData.get("hero_cta_secondary_label") || "",
      ).trim(),
      hero_cta_secondary_href: String(
        formData.get("hero_cta_secondary_href") || "",
      ).trim(),
      hero_background_url:
        String(formData.get("hero_background_url") || "").trim() || null,
      hero_background_mobile_url:
        String(formData.get("hero_background_mobile_url") || "").trim() ||
        null,
      hero_eyebrow_pa:
        String(formData.get("hero_eyebrow_pa") || "").trim() || null,
      hero_headline_pa:
        String(formData.get("hero_headline_pa") || "").trim() || null,
      hero_subheadline_pa:
        String(formData.get("hero_subheadline_pa") || "").trim() || null,
      hero_cta_primary_label_pa:
        String(formData.get("hero_cta_primary_label_pa") || "").trim() || null,
      hero_cta_secondary_label_pa:
        String(formData.get("hero_cta_secondary_label_pa") || "").trim() ||
        null,
      about_eyebrow: String(formData.get("about_eyebrow") || "").trim(),
      about_headline: String(formData.get("about_headline") || "").trim(),
      about_body: String(formData.get("about_body") || "").trim(),
      about_eyebrow_pa:
        String(formData.get("about_eyebrow_pa") || "").trim() || null,
      about_headline_pa:
        String(formData.get("about_headline_pa") || "").trim() || null,
      about_body_pa: String(formData.get("about_body_pa") || "").trim() || null,
      membership_headline: String(
        formData.get("membership_headline") || "",
      ).trim(),
      membership_body: String(formData.get("membership_body") || "").trim(),
      membership_headline_pa:
        String(formData.get("membership_headline_pa") || "").trim() || null,
      membership_body_pa:
        String(formData.get("membership_body_pa") || "").trim() || null,
      ...(stats ? { stats } : {}),
      updated_by: context.userId,
      is_published: true,
    };

    if (!payload.hero_headline || !payload.about_headline) {
      return { error: "Hero and about headlines are required." };
    }

    const supabase = await createClient();

    const { data: existing } = await supabase
      .from("homepage_content")
      .select("id")
      .eq("is_published", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    async function write(body: Record<string, unknown>) {
      return existing?.id
        ? supabase.from("homepage_content").update(body).eq("id", existing.id)
        : supabase.from("homepage_content").insert(body);
    }

    let { error } = await write(payload);

    // If optional columns aren't migrated yet, strip them and retry once.
    if (error && isMissingColumnError(error.message)) {
      const stripped = { ...payload };
      for (const col of OPTIONAL_COLUMNS) {
        delete stripped[col];
      }
      const retry = await write(stripped);
      error = retry.error;

      if (!error) {
        revalidatePath("/");
        return {
          success:
            "Homepage saved. Run migrations 20260801070000 and 20260801080000 in Supabase so hero image + Punjabi fields persist.",
        };
      }
    }

    if (error) {
      if (isMissingColumnError(error.message)) {
        return {
          error:
            "Database is missing homepage columns. Run supabase/migrations/20260801070000_hero_background.sql, 80000, and 20260801100000_hero_mobile_background.sql in the Supabase SQL Editor.",
        };
      }
      return { error: error.message };
    }

    // Revalidate public site only — revalidating the current admin page
    // can leave useActionState pending stuck in a refresh loop.
    revalidatePath("/");
    return { success: "Homepage content saved." };
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? err.message
          : "Could not save homepage. Please try again.",
    };
  }
}
