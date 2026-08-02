import { createClient } from "@/lib/supabase/server";
import {
  COMMUNITY_WORK,
  CORE_VALUES,
  DEFAULT_ABOUT_QUOTES,
  DEFAULT_HOMEPAGE,
  STATS,
} from "@/lib/constants";
import {
  DEFAULT_HERO_FRAME,
  parseHeroFrame,
  type HeroImageFrame,
} from "@/lib/cms/hero-frame";

export type { HeroImageFrame };

export type HomepageStat = {
  label: string;
  value: number;
  suffix?: string;
  icon?: string;
};

export type HomepageValue = {
  title: string;
  description: string;
};

export type HomepageCommunityItem = {
  title: string;
  slug: string;
};

export type HomepageQuote = {
  quote: string;
  attribution?: string;
  image_url?: string;
};

export type HomepageContent = {
  hero_eyebrow: string;
  hero_headline: string;
  hero_subheadline: string;
  hero_cta_primary_label: string;
  hero_cta_primary_href: string;
  hero_cta_secondary_label: string;
  hero_cta_secondary_href: string;
  hero_background_url: string | null;
  hero_background_mobile_url: string | null;
  hero_bg_frame: HeroImageFrame;
  hero_bg_mobile_frame: HeroImageFrame;
  hero_eyebrow_pa: string | null;
  hero_headline_pa: string | null;
  hero_subheadline_pa: string | null;
  hero_cta_primary_label_pa: string | null;
  hero_cta_secondary_label_pa: string | null;
  about_eyebrow: string;
  about_headline: string;
  about_body: string;
  about_eyebrow_pa: string | null;
  about_headline_pa: string | null;
  about_body_pa: string | null;
  about_quotes: HomepageQuote[];
  events_background_url: string | null;
  admin_background_url: string | null;
  membership_headline: string;
  membership_body: string;
  membership_headline_pa: string | null;
  membership_body_pa: string | null;
  stats: HomepageStat[];
  core_values: HomepageValue[];
  community_work: HomepageCommunityItem[];
};

function normalizeQuotes(raw: unknown): HomepageQuote[] {
  if (!Array.isArray(raw) || !raw.length) {
    return DEFAULT_ABOUT_QUOTES.map((q) => ({ ...q }));
  }
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const quote = String(row.quote || "").trim();
      if (!quote) return null;
      return {
        quote,
        attribution: String(row.attribution || "").trim() || undefined,
        image_url: String(row.image_url || "").trim() || undefined,
      };
    })
    .filter(Boolean) as HomepageQuote[];
}

function fallbackHomepage(): HomepageContent {
  return {
    ...DEFAULT_HOMEPAGE,
    hero_background_url: null,
    hero_background_mobile_url: null,
    hero_bg_frame: { ...DEFAULT_HERO_FRAME },
    hero_bg_mobile_frame: { ...DEFAULT_HERO_FRAME },
    hero_eyebrow_pa: null,
    hero_headline_pa: null,
    hero_subheadline_pa: null,
    hero_cta_primary_label_pa: null,
    hero_cta_secondary_label_pa: null,
    about_eyebrow_pa: null,
    about_headline_pa: null,
    about_body_pa: null,
    about_quotes: DEFAULT_ABOUT_QUOTES.map((q) => ({ ...q })),
    events_background_url: null,
    admin_background_url: null,
    membership_headline_pa: null,
    membership_body_pa: null,
    stats: STATS.map((s) => ({ ...s })),
    core_values: CORE_VALUES.map((v) => ({ ...v })),
    community_work: COMMUNITY_WORK.map((c) => ({ ...c })),
  };
}

function resolveMembershipHref(href: string | null | undefined, label?: string | null) {
  const raw = (href || "").trim();
  const text = (label || "").toLowerCase();
  if (
    !raw ||
    raw === "#" ||
    raw.includes("membership") ||
    raw.includes("register") ||
    text.includes("member") ||
    text.includes("join")
  ) {
    return "/membership";
  }
  return raw.split("#")[0] || raw;
}

export async function getPublishedHomepage(): Promise<HomepageContent> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("homepage_content")
      .select("*")
      .eq("is_published", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return fallbackHomepage();

    const primaryLabel =
      data.hero_cta_primary_label ?? DEFAULT_HOMEPAGE.hero_cta_primary_label;

    return {
      hero_eyebrow: data.hero_eyebrow ?? DEFAULT_HOMEPAGE.hero_eyebrow,
      hero_headline: data.hero_headline ?? DEFAULT_HOMEPAGE.hero_headline,
      hero_subheadline:
        data.hero_subheadline ?? DEFAULT_HOMEPAGE.hero_subheadline,
      hero_cta_primary_label: primaryLabel,
      hero_cta_primary_href: resolveMembershipHref(
        data.hero_cta_primary_href ?? DEFAULT_HOMEPAGE.hero_cta_primary_href,
        primaryLabel,
      ),
      hero_cta_secondary_label:
        data.hero_cta_secondary_label ??
        DEFAULT_HOMEPAGE.hero_cta_secondary_label,
      hero_cta_secondary_href:
        data.hero_cta_secondary_href ?? DEFAULT_HOMEPAGE.hero_cta_secondary_href,
      hero_background_url: data.hero_background_url ?? null,
      hero_background_mobile_url: data.hero_background_mobile_url ?? null,
      hero_bg_frame: parseHeroFrame({
        focusX: data.hero_bg_focus_x,
        focusY: data.hero_bg_focus_y,
        zoom: data.hero_bg_zoom,
      }),
      hero_bg_mobile_frame: parseHeroFrame({
        focusX: data.hero_bg_mobile_focus_x,
        focusY: data.hero_bg_mobile_focus_y,
        zoom: data.hero_bg_mobile_zoom,
      }),
      hero_eyebrow_pa: data.hero_eyebrow_pa ?? null,
      hero_headline_pa: data.hero_headline_pa ?? null,
      hero_subheadline_pa: data.hero_subheadline_pa ?? null,
      hero_cta_primary_label_pa: data.hero_cta_primary_label_pa ?? null,
      hero_cta_secondary_label_pa: data.hero_cta_secondary_label_pa ?? null,
      about_eyebrow: data.about_eyebrow ?? DEFAULT_HOMEPAGE.about_eyebrow,
      about_headline: data.about_headline ?? DEFAULT_HOMEPAGE.about_headline,
      about_body: data.about_body ?? DEFAULT_HOMEPAGE.about_body,
      about_eyebrow_pa: data.about_eyebrow_pa ?? null,
      about_headline_pa: data.about_headline_pa ?? null,
      about_body_pa: data.about_body_pa ?? null,
      about_quotes: normalizeQuotes(data.about_quotes),
      events_background_url: data.events_background_url ?? null,
      admin_background_url: data.admin_background_url ?? null,
      membership_headline:
        data.membership_headline ?? DEFAULT_HOMEPAGE.membership_headline,
      membership_body:
        data.membership_body ?? DEFAULT_HOMEPAGE.membership_body,
      membership_headline_pa: data.membership_headline_pa ?? null,
      membership_body_pa: data.membership_body_pa ?? null,
      stats: Array.isArray(data.stats) && data.stats.length
        ? data.stats
        : STATS.map((s) => ({ ...s })),
      core_values:
        Array.isArray(data.core_values) && data.core_values.length
          ? data.core_values
          : CORE_VALUES.map((v) => ({ ...v })),
      community_work:
        Array.isArray(data.community_work) && data.community_work.length
          ? data.community_work
          : COMMUNITY_WORK.map((c) => ({ ...c })),
    };
  } catch {
    return fallbackHomepage();
  }
}

/** Lightweight fetch for admin chrome background only. */
export async function getAdminBackgroundUrl(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("homepage_content")
      .select("admin_background_url")
      .eq("is_published", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data?.admin_background_url ?? null;
  } catch {
    return null;
  }
}
