import { createClient } from "@/lib/supabase/server";
import {
  COMMUNITY_WORK,
  FEATURED_BOOKS,
  RESOURCE_CATEGORIES,
} from "@/lib/constants";

export type EventRow = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  body: string | null;
  location: string | null;
  location_icon: string;
  starts_at: string;
  ends_at: string | null;
  registration_open: boolean;
  tone: string;
  cover_image_url: string | null;
};

export type NewsRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  category: string;
  published_at: string;
  is_pinned: boolean;
  cover_image_url: string | null;
};

export type ResourceRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  category: string;
  file_size_label: string | null;
  icon: string;
  tone: string;
  file_url: string | null;
  external_url: string | null;
  thumbnail_url?: string | null;
  resource_type: string;
};

export type CommunityRow = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  body: string | null;
  badge: string | null;
  badge_tone: string;
  status: string;
  cover_image_url: string | null;
};

export type MarketplaceRow = {
  id: string;
  slug: string;
  title: string;
  author: string | null;
  summary: string | null;
  price_label: string;
  rating: number | null;
  review_count: number;
  cover_image_url: string | null;
  buy_url: string | null;
};

export type GalleryMediaRow = {
  id: string;
  title: string | null;
  media_url: string;
  caption: string | null;
  media_type: string;
};

function monthDay(iso: string) {
  const d = new Date(iso);
  return {
    month: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: String(d.getDate()).padStart(2, "0"),
  };
}

export async function getPublishedEvents(limit = 20): Promise<EventRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .select(
        "id, slug, title, summary, body, location, location_icon, starts_at, ends_at, registration_open, tone, cover_image_url",
      )
      .eq("is_published", true)
      .order("starts_at", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("getPublishedEvents", error.message);
      return [];
    }
    return data ?? [];
  } catch {
    return [];
  }
}

export function formatEventDate(event: EventRow) {
  return monthDay(event.starts_at);
}

export async function getEventBySlug(slug: string): Promise<EventRow | null> {
  const decoded = decodeURIComponent(slug || "").trim();
  if (!decoded) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .select(
        "id, slug, title, summary, body, location, location_icon, starts_at, ends_at, registration_open, tone, cover_image_url",
      )
      .eq("slug", decoded)
      .eq("is_published", true)
      .maybeSingle();
    if (error) {
      console.error("getEventBySlug", error.message);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export async function getPublishedNews(limit = 20): Promise<NewsRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("news_posts")
      .select(
        "id, slug, title, excerpt, body, category, published_at, is_pinned, cover_image_url",
      )
      .eq("is_published", true)
      .order("is_pinned", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error || !data?.length) {
      return [
        {
          id: "fallback-news-1",
          slug: "scholarship-outreach-expansion",
          title: "Foundation expands scholarship outreach",
          excerpt:
            "Press releases, media coverage, and community updates will appear here once the news CMS module is connected.",
          body: null,
          category: "announcement",
          published_at: new Date().toISOString(),
          is_pinned: true,
          cover_image_url: null,
        },
        {
          id: "fallback-news-2",
          slug: "leadership-circle-cohort",
          title: "District leadership circle announces cohort",
          excerpt:
            "Announcements and articles will be editable from the admin portal.",
          body: null,
          category: "article",
          published_at: new Date().toISOString(),
          is_pinned: false,
          cover_image_url: null,
        },
      ];
    }
    return data;
  } catch {
    return [];
  }
}

export async function getNewsBySlug(slug: string): Promise<NewsRow | null> {
  const posts = await getPublishedNews(50);
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function getPublishedResources(
  limit = 80,
): Promise<ResourceRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("resources")
      .select(
        "id, slug, title, subtitle, description, category, file_size_label, icon, tone, file_url, external_url, thumbnail_url, resource_type",
      )
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .limit(limit);

    if (error || !data) return [];
    return data as ResourceRow[];
  } catch {
    return [];
  }
}

export async function getPublishedResourcesByCategory(
  category: string,
  limit = 80,
): Promise<ResourceRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("resources")
      .select(
        "id, slug, title, subtitle, description, category, file_size_label, icon, tone, file_url, external_url, thumbnail_url, resource_type",
      )
      .eq("is_published", true)
      .eq("category", category)
      .order("sort_order", { ascending: true })
      .limit(limit);

    if (error || !data) return [];
    return data as ResourceRow[];
  } catch {
    return [];
  }
}

/** Counts of published items per known library category */
export async function getResourceCategoryCounts(): Promise<
  Record<string, number>
> {
  const counts: Record<string, number> = Object.fromEntries(
    RESOURCE_CATEGORIES.map((c) => [c.slug, 0]),
  );
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("resources")
      .select("category")
      .eq("is_published", true);
    if (error || !data) return counts;
    for (const row of data) {
      const key = String(row.category || "");
      if (key in counts) counts[key] += 1;
    }
    return counts;
  } catch {
    return counts;
  }
}

export async function getPublishedCommunity(
  limit = 20,
): Promise<CommunityRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("community_projects")
      .select(
        "id, slug, title, summary, body, badge, badge_tone, status, cover_image_url",
      )
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .limit(limit);

    if (error || !data?.length) {
      return COMMUNITY_WORK.map((c, i) => ({
        id: `fallback-community-${i}`,
        slug: c.slug,
        title: c.title,
        summary: c.description,
        body: null,
        badge: c.badge,
        badge_tone: c.badgeTone,
        status: "ongoing",
        cover_image_url: null,
      }));
    }
    return data;
  } catch {
    return [];
  }
}

export async function getCommunityBySlug(
  slug: string,
): Promise<CommunityRow | null> {
  const items = await getPublishedCommunity(50);
  return items.find((i) => i.slug === slug) ?? null;
}

export async function getPublishedMarketplace(
  limit = 20,
): Promise<MarketplaceRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("marketplace_items")
      .select(
        "id, slug, title, author, summary, price_label, rating, review_count, cover_image_url, buy_url",
      )
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .limit(limit);

    if (error || !data?.length) {
      return FEATURED_BOOKS.map((b, i) => ({
        id: `fallback-book-${i}`,
        slug: b.title.toLowerCase().replace(/\s+/g, "-"),
        title: b.title,
        author: "Dr. B. R. Ambedkar",
        summary: null,
        price_label: b.price,
        rating: b.rating,
        review_count: b.reviews,
        cover_image_url: null,
        buy_url: null,
      }));
    }
    return data;
  } catch {
    return [];
  }
}

export async function getFeaturedGallery(limit = 12): Promise<GalleryMediaRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("gallery_media")
      .select("id, title, media_url, caption, media_type")
      .eq("is_published", true)
      .order("is_featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .limit(limit);

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}
