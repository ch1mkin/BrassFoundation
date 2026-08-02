import { createClient } from "@/lib/supabase/server";
import { DEFAULT_RESOURCE_CATEGORIES } from "@/lib/constants";

export type ResourceCategoryRow = {
  id?: string;
  slug: string;
  title: string;
  subtitle: string | null;
  icon: string;
  tone: "primary" | "secondary" | "tertiary" | "brand" | string;
  sort_order?: number;
};

export async function getResourceCategories(
  includeUnpublished = false,
): Promise<ResourceCategoryRow[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("resource_categories")
      .select("id, slug, title, subtitle, icon, tone, sort_order")
      .order("sort_order", { ascending: true });
    if (!includeUnpublished) {
      query = query.eq("is_published", true);
    }
    const { data, error } = await query;
    if (error || !data?.length) {
      return DEFAULT_RESOURCE_CATEGORIES.map((c) => ({
        slug: c.slug,
        title: c.title,
        subtitle: c.subtitle,
        icon: c.icon,
        tone: c.tone,
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
