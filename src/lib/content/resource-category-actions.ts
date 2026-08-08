"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canAccessAdmin, getUserContext } from "@/lib/auth/session";
import { ContentActionState, slugify } from "@/lib/content/utils";

const TONES = new Set(["primary", "secondary", "tertiary", "brand"]);

export async function upsertResourceCategoryAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const context = await getUserContext();
  if (!context || !canAccessAdmin(context)) {
    return { error: "Unauthorized." };
  }

  const title = String(formData.get("title") || "").trim();
  if (!title) return { error: "Category title is required." };

  const slug =
    String(formData.get("slug") || "").trim() || slugify(title);
  if (!slug) return { error: "Could not create a slug." };

  const icon = String(formData.get("icon") || "menu_book").trim();
  const tone = String(formData.get("tone") || "primary").trim();
  if (!TONES.has(tone)) return { error: "Invalid tone." };

  const payload = {
    title,
    slug,
    subtitle: String(formData.get("subtitle") || "").trim() || null,
    icon: icon || "menu_book",
    tone,
    sort_order: Number(formData.get("sort_order") || 100),
    is_published: formData.get("is_published") === "on",
    thumbnail_url:
      String(formData.get("thumbnail_url") || "").trim() || null,
    updated_at: new Date().toISOString(),
  };

  const supabase = await createClient();
  const { error } = await supabase.from("resource_categories").upsert(payload, {
    onConflict: "slug",
  });

  if (error) {
    if (/thumbnail_url/i.test(error.message)) {
      return {
        error:
          "Run supabase/migrations/20260808220000_resource_category_thumbnails.sql then try again.",
      };
    }
    if (/relation .* does not exist|Could not find/i.test(error.message)) {
      return {
        error:
          "resource_categories table missing. Run supabase/migrations/20260802070000_resource_categories.sql",
      };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/resources");
  revalidatePath("/resources");
  revalidatePath(`/resources/${slug}`);
  revalidatePath("/");
  return { success: "Category saved." };
}

export async function deleteResourceCategoryAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const context = await getUserContext();
  if (!context || !canAccessAdmin(context)) {
    return { error: "Unauthorized." };
  }

  const id = String(formData.get("id") || "").trim();
  if (!id) return { error: "Missing category id." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("resource_categories")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/resources");
  revalidatePath("/resources");
  revalidatePath("/");
  return { success: "Category deleted." };
}
