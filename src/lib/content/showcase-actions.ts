"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canAccessAdmin, getUserContext } from "@/lib/auth/session";
import type { ContentActionState } from "@/lib/content/utils";

export async function upsertAchieverAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const context = await getUserContext();
  if (!context || !canAccessAdmin(context)) return { error: "Unauthorized." };

  const id = String(formData.get("id") || "").trim() || null;
  const full_name = String(formData.get("full_name") || "").trim();
  if (!full_name) return { error: "Name is required." };

  const payload = {
    full_name,
    age: Number(formData.get("age") || 0) || null,
    photo_url: String(formData.get("photo_url") || "").trim() || null,
    achievement: String(formData.get("achievement") || "").trim() || null,
    sort_order: Number(formData.get("sort_order") || 0),
    is_published: formData.get("is_published") === "on",
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("achievers").update(payload).eq("id", id)
    : await supabase.from("achievers").insert(payload);

  if (error) return { error: error.message };
  revalidatePath("/achievers");
  revalidatePath("/admin/achievers");
  return { success: id ? "Achiever updated." : "Achiever added." };
}

export async function deleteAchieverAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const context = await getUserContext();
  if (!context || !canAccessAdmin(context)) return { error: "Unauthorized." };
  const id = String(formData.get("id") || "").trim();
  if (!id) return { error: "Missing id." };
  const supabase = await createClient();
  const { error } = await supabase.from("achievers").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/achievers");
  revalidatePath("/admin/achievers");
  return { success: "Achiever deleted." };
}

export async function upsertBrochureAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const context = await getUserContext();
  if (!context || !canAccessAdmin(context)) return { error: "Unauthorized." };

  const id = String(formData.get("id") || "").trim() || null;
  const title = String(formData.get("title") || "").trim() || "Brochure";
  const file_url = String(formData.get("file_url") || "").trim();
  if (!file_url) return { error: "Brochure file URL is required." };

  const payload = {
    title,
    description: String(formData.get("description") || "").trim() || null,
    file_url,
    cover_image_url:
      String(formData.get("cover_image_url") || "").trim() || null,
    sort_order: Number(formData.get("sort_order") || 0),
    is_published: formData.get("is_published") === "on",
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("organisation_brochures").update(payload).eq("id", id)
    : await supabase.from("organisation_brochures").insert(payload);

  if (error) return { error: error.message };
  revalidatePath("/brochure");
  revalidatePath("/admin/brochure");
  return { success: id ? "Brochure updated." : "Brochure published." };
}

export async function deleteBrochureAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const context = await getUserContext();
  if (!context || !canAccessAdmin(context)) return { error: "Unauthorized." };
  const id = String(formData.get("id") || "").trim();
  if (!id) return { error: "Missing id." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("organisation_brochures")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/brochure");
  revalidatePath("/admin/brochure");
  return { success: "Brochure deleted." };
}

export async function upsertUsefulLinkAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const context = await getUserContext();
  if (!context || !canAccessAdmin(context)) return { error: "Unauthorized." };

  const id = String(formData.get("id") || "").trim() || null;
  const title = String(formData.get("title") || "").trim();
  const url = String(formData.get("url") || "").trim();
  if (!title || !url) return { error: "Title and URL are required." };

  const payload = {
    title,
    url,
    description: String(formData.get("description") || "").trim() || null,
    sort_order: Number(formData.get("sort_order") || 0),
    is_published: formData.get("is_published") === "on",
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("useful_links").update(payload).eq("id", id)
    : await supabase.from("useful_links").insert(payload);

  if (error) return { error: error.message };
  revalidatePath("/resources");
  revalidatePath("/admin/useful-links");
  return { success: id ? "Link updated." : "Link added." };
}

export async function deleteUsefulLinkAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const context = await getUserContext();
  if (!context || !canAccessAdmin(context)) return { error: "Unauthorized." };
  const id = String(formData.get("id") || "").trim();
  if (!id) return { error: "Missing id." };
  const supabase = await createClient();
  const { error } = await supabase.from("useful_links").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/resources");
  revalidatePath("/admin/useful-links");
  return { success: "Link deleted." };
}
