import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { PUBLIC_CMS_TAG } from "@/lib/cache/public";
import { DEFAULT_RESOURCE_CATEGORIES } from "@/lib/constants";

export type ResourceCategoryRow = {
  id?: string;
  slug: string;
  title: string;
  subtitle: string | null;
  icon: string;
  tone: "primary" | "secondary" | "tertiary" | "brand" | string;
  sort_order?: number;
  thumbnail_url?: string | null;
};

export async function getResourceCategories(
  includeUnpublished = false,
): Promise<ResourceCategoryRow[]> {
  if (includeUnpublished) {
    return loadResourceCategories(true);
  }
  return loadPublishedResourceCategories();
}

const loadPublishedResourceCategories = unstable_cache(
  () => loadResourceCategories(false),
  ["resource-categories-published"],
  { revalidate: 120, tags: [PUBLIC_CMS_TAG] },
);

async function loadResourceCategories(
  includeUnpublished: boolean,
): Promise<ResourceCategoryRow[]> {
  try {
    const supabase = includeUnpublished
      ? await createClient()
      : createPublicClient();
    let query = supabase
      .from("resource_categories")
      .select(
        "id, slug, title, subtitle, icon, tone, sort_order, thumbnail_url",
      )
      .order("sort_order", { ascending: true });
    if (!includeUnpublished) {
      query = query.eq("is_published", true);
    }
    const { data, error } = await query;
    if (error || !data?.length) {
      // Older DBs may not have thumbnail_url yet — retry without it
      if (error && /thumbnail_url/i.test(error.message)) {
        let fallback = supabase
          .from("resource_categories")
          .select("id, slug, title, subtitle, icon, tone, sort_order")
          .order("sort_order", { ascending: true });
        if (!includeUnpublished) {
          fallback = fallback.eq("is_published", true);
        }
        const { data: rows } = await fallback;
        if (rows?.length) {
          return rows.map((c) => ({
            ...c,
            thumbnail_url: null,
          })) as ResourceCategoryRow[];
        }
      }
      return DEFAULT_RESOURCE_CATEGORIES.map((c) => ({
        slug: c.slug,
        title: c.title,
        subtitle: c.subtitle,
        icon: c.icon,
        tone: c.tone,
        thumbnail_url: null,
      }));
    }
    return data as ResourceCategoryRow[];
  } catch {
    return DEFAULT_RESOURCE_CATEGORIES.map((c) => ({
      slug: c.slug,
      title: c.title,
      subtitle: c.subtitle,
      icon: c.icon,
      tone: c.tone,
      thumbnail_url: null,
    }));
  }
}

export async function getResourceCategoryBySlug(
  slug: string,
): Promise<ResourceCategoryRow | null> {
  const cats = await getResourceCategories(true);
  return cats.find((c) => c.slug === slug) ?? null;
}

export async function isValidResourceCategorySlug(
  slug: string,
): Promise<boolean> {
  const cats = await getResourceCategories(true);
  return cats.some((c) => c.slug === slug);
}
