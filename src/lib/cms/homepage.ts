import { createClient } from "@/lib/supabase/server";
import {
  COMMUNITY_WORK,
  CORE_VALUES,
  DEFAULT_HOMEPAGE,
  STATS,
} from "@/lib/constants";

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

export type HomepageContent = {
  hero_eyebrow: string;
  hero_headline: string;
  hero_subheadline: string;
  hero_cta_primary_label: string;
  hero_cta_primary_href: string;
  hero_cta_secondary_label: string;
  hero_cta_secondary_href: string;
  hero_background_url: string | null;
  about_eyebrow: string;
  about_headline: string;
  about_body: string;
  membership_headline: string;
  membership_body: string;
  stats: HomepageStat[];
  core_values: HomepageValue[];
  community_work: HomepageCommunityItem[];
};

function fallbackHomepage(): HomepageContent {
  return {
    ...DEFAULT_HOMEPAGE,
    hero_background_url: null,
    stats: STATS.map((s) => ({ ...s })),
    core_values: CORE_VALUES.map((v) => ({ ...v })),
    community_work: COMMUNITY_WORK.map((c) => ({ ...c })),
  };
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

    return {
      hero_eyebrow: data.hero_eyebrow ?? DEFAULT_HOMEPAGE.hero_eyebrow,
      hero_headline: data.hero_headline ?? DEFAULT_HOMEPAGE.hero_headline,
      hero_subheadline:
        data.hero_subheadline ?? DEFAULT_HOMEPAGE.hero_subheadline,
      hero_cta_primary_label:
        data.hero_cta_primary_label ?? DEFAULT_HOMEPAGE.hero_cta_primary_label,
      hero_cta_primary_href:
        data.hero_cta_primary_href ?? DEFAULT_HOMEPAGE.hero_cta_primary_href,
      hero_cta_secondary_label:
        data.hero_cta_secondary_label ??
        DEFAULT_HOMEPAGE.hero_cta_secondary_label,
      hero_cta_secondary_href:
        data.hero_cta_secondary_href ?? DEFAULT_HOMEPAGE.hero_cta_secondary_href,
      hero_background_url: data.hero_background_url ?? null,
      about_eyebrow: data.about_eyebrow ?? DEFAULT_HOMEPAGE.about_eyebrow,
      about_headline: data.about_headline ?? DEFAULT_HOMEPAGE.about_headline,
      about_body: data.about_body ?? DEFAULT_HOMEPAGE.about_body,
      membership_headline:
        data.membership_headline ?? DEFAULT_HOMEPAGE.membership_headline,
      membership_body:
        data.membership_body ?? DEFAULT_HOMEPAGE.membership_body,
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
