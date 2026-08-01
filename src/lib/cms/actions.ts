"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canAccessAdmin, getUserContext } from "@/lib/auth/session";

export type CmsActionState = {
  error?: string;
  success?: string;
};

export async function updateHomepageAction(
  _prev: CmsActionState,
  formData: FormData,
): Promise<CmsActionState> {
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

  const payload = {
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
    about_eyebrow: String(formData.get("about_eyebrow") || "").trim(),
    about_headline: String(formData.get("about_headline") || "").trim(),
    about_body: String(formData.get("about_body") || "").trim(),
    membership_headline: String(
      formData.get("membership_headline") || "",
    ).trim(),
    membership_body: String(formData.get("membership_body") || "").trim(),
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

  const { error } = existing?.id
    ? await supabase
        .from("homepage_content")
        .update(payload)
        .eq("id", existing.id)
    : await supabase.from("homepage_content").insert(payload);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: "Homepage content saved." };
}
