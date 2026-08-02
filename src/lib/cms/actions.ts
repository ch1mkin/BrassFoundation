"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canAccessAdmin, getUserContext } from "@/lib/auth/session";
import { clampHeroFocus, clampHeroZoom } from "@/lib/cms/hero-frame";

export type CmsActionState = {
  error?: string;
  success?: string;
};

/** Framing columns — may be missing until migration 20260802080000. */
const FRAMING_COLUMNS = [
  "hero_bg_focus_x",
  "hero_bg_focus_y",
  "hero_bg_zoom",
  "hero_bg_mobile_focus_x",
  "hero_bg_mobile_focus_y",
  "hero_bg_mobile_zoom",
] as const;

/** Never strip these when recovering from a missing framing column. */
const HERO_URL_COLUMNS = [
  "hero_background_url",
  "hero_background_mobile_url",
] as const;

const OTHER_OPTIONAL_COLUMNS = [
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
  "about_quotes",
  "events_background_url",
  "admin_background_url",
] as const;

function isMissingColumnError(message: string) {
  return (
    /column .* does not exist/i.test(message) ||
    /could not find the .* column/i.test(message) ||
    /schema cache/i.test(message)
  );
}

function extractMissingColumn(message: string): string | null {
  const patterns = [
    /Could not find the '([^']+)' column/i,
    /column "([^"]+)" of relation/i,
    /column ([a-z0-9_]+) does not exist/i,
  ];
  for (const re of patterns) {
    const m = message.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

function revalidateHomepage() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/website");
}

async function getHomepageRowId(
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const { data: existing } = await supabase
    .from("homepage_content")
    .select("id")
    .eq("is_published", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return existing?.id as string | undefined;
}

async function writeHomepage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string | undefined,
  body: Record<string, unknown>,
) {
  return id
    ? supabase.from("homepage_content").update(body).eq("id", id)
    : supabase.from("homepage_content").insert(body);
}

/**
 * Persist payload; if a column is missing, strip only that column (or framing)
 * and retry. Hero image URLs are preserved whenever possible.
 */
async function writeHomepageResilient(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string | undefined,
  payload: Record<string, unknown>,
): Promise<{ error: { message: string } | null; droppedFraming: boolean }> {
  let body: Record<string, unknown> = { ...payload };
  let droppedFraming = false;

  for (let attempt = 0; attempt < 24; attempt++) {
    const { error } = await writeHomepage(supabase, id, body);
    if (!error) return { error: null, droppedFraming };

    if (!isMissingColumnError(error.message)) {
      return { error, droppedFraming };
    }

    const missing = extractMissingColumn(error.message);
    if (missing && missing in body) {
      if ((FRAMING_COLUMNS as readonly string[]).includes(missing)) {
        droppedFraming = true;
      }
      delete body[missing];
      continue;
    }

    // Can't parse column — drop framing first (keep hero URLs), then other optionals
    if (!droppedFraming) {
      const next = { ...body };
      for (const col of FRAMING_COLUMNS) delete next[col];
      body = next;
      droppedFraming = true;
      continue;
    }

    let removed = false;
    const next = { ...body };
    for (const col of OTHER_OPTIONAL_COLUMNS) {
      if (col in next) {
        delete next[col];
        removed = true;
        break;
      }
    }
    if (removed) {
      body = next;
      continue;
    }

    // Last resort: strip hero URLs only if they themselves are the problem
    for (const col of HERO_URL_COLUMNS) {
      if (col in next) {
        delete next[col];
        body = next;
        removed = true;
        break;
      }
    }
    if (!removed) return { error, droppedFraming };
  }

  return {
    error: { message: "Could not save homepage after column fallbacks." },
    droppedFraming,
  };
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

    const quotesRaw = String(formData.get("about_quotes_json") || "").trim();
    let about_quotes: unknown = undefined;
    if (quotesRaw) {
      try {
        about_quotes = JSON.parse(quotesRaw);
      } catch {
        return { error: "Invalid quotes JSON." };
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
      hero_bg_focus_x: clampHeroFocus(formData.get("hero_bg_focus_x")),
      hero_bg_focus_y: clampHeroFocus(formData.get("hero_bg_focus_y")),
      hero_bg_zoom: clampHeroZoom(formData.get("hero_bg_zoom")),
      hero_bg_mobile_focus_x: clampHeroFocus(
        formData.get("hero_bg_mobile_focus_x"),
      ),
      hero_bg_mobile_focus_y: clampHeroFocus(
        formData.get("hero_bg_mobile_focus_y"),
      ),
      hero_bg_mobile_zoom: clampHeroZoom(formData.get("hero_bg_mobile_zoom")),
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
      events_background_url:
        String(formData.get("events_background_url") || "").trim() || null,
      admin_background_url:
        String(formData.get("admin_background_url") || "").trim() || null,
      membership_headline: String(
        formData.get("membership_headline") || "",
      ).trim(),
      membership_body: String(formData.get("membership_body") || "").trim(),
      membership_headline_pa:
        String(formData.get("membership_headline_pa") || "").trim() || null,
      membership_body_pa:
        String(formData.get("membership_body_pa") || "").trim() || null,
      ...(stats ? { stats } : {}),
      ...(about_quotes ? { about_quotes } : {}),
      updated_by: context.userId,
      is_published: true,
    };

    if (!payload.hero_headline || !payload.about_headline) {
      return { error: "Hero and about headlines are required." };
    }

    const supabase = await createClient();
    const id = await getHomepageRowId(supabase);
    const { error, droppedFraming } = await writeHomepageResilient(
      supabase,
      id,
      payload,
    );

    if (error) {
      if (isMissingColumnError(error.message)) {
        return {
          error:
            "Database is missing homepage columns. Run supabase/migrations/20260802080000_hero_image_framing.sql (and earlier homepage migrations) in the Supabase SQL Editor.",
        };
      }
      return { error: error.message };
    }

    revalidateHomepage();
    return {
      success: droppedFraming
        ? "Homepage saved, but hero framing columns are missing. Run migration 20260802080000_hero_image_framing.sql so drag/zoom values persist. Baked crop images still save."
        : "Homepage content saved.",
    };
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? err.message
          : "Could not save homepage. Please try again.",
    };
  }
}

/**
 * Persist a baked (or framed) hero image immediately so the live site matches
 * admin without requiring a full homepage form submit first.
 */
export async function persistHeroBakeAction(input: {
  variant: "desktop" | "mobile";
  url: string;
  focusX?: number;
  focusY?: number;
  zoom?: number;
}): Promise<CmsActionState> {
  try {
    const context = await getUserContext();
    if (!context || !canAccessAdmin(context)) {
      return { error: "Unauthorized." };
    }

    const url = String(input.url || "").trim();
    if (!url) return { error: "Missing hero image URL." };

    const focusX = clampHeroFocus(input.focusX ?? 50);
    const focusY = clampHeroFocus(input.focusY ?? 50);
    const zoom = clampHeroZoom(input.zoom ?? 1);

    const payload: Record<string, unknown> =
      input.variant === "mobile"
        ? {
            hero_background_mobile_url: url,
            hero_bg_mobile_focus_x: focusX,
            hero_bg_mobile_focus_y: focusY,
            hero_bg_mobile_zoom: zoom,
            updated_by: context.userId,
            is_published: true,
          }
        : {
            hero_background_url: url,
            hero_bg_focus_x: focusX,
            hero_bg_focus_y: focusY,
            hero_bg_zoom: zoom,
            updated_by: context.userId,
            is_published: true,
          };

    const supabase = await createClient();
    const id = await getHomepageRowId(supabase);
    if (!id) {
      return {
        error:
          "No homepage row found. Save the homepage once, then bake the crop again.",
      };
    }

    const { error, droppedFraming } = await writeHomepageResilient(
      supabase,
      id,
      payload,
    );

    if (error) {
      return {
        error:
          error.message ||
          "Could not save baked hero image. Check storage permissions and framing migration.",
      };
    }

    revalidateHomepage();
    return {
      success: droppedFraming
        ? "Cropped hero image published. Run migration 20260802080000_hero_image_framing.sql so focus/zoom values also persist."
        : "Cropped hero image published to the live site.",
    };
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? err.message
          : "Could not save baked hero image.",
    };
  }
}
