"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canAccessAdmin, getUserContext } from "@/lib/auth/session";
import { ContentActionState, slugify } from "@/lib/content/utils";

async function requireAdmin() {
  const context = await getUserContext();
  if (!context || !canAccessAdmin(context)) return null;
  return context;
}

export async function upsertGalleryAlbumAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Unauthorized." };

  const id = String(formData.get("id") || "").trim() || null;
  const title = String(formData.get("title") || "").trim();
  const heading =
    String(formData.get("heading") || "").trim() || title;
  const slug =
    String(formData.get("slug") || "").trim() || slugify(title);

  if (!title) return { error: "Album title is required." };

  const payload = {
    title,
    heading,
    slug,
    description: String(formData.get("description") || "").trim() || null,
    display_mode: String(formData.get("display_mode") || "grid").trim(),
    event_date: String(formData.get("event_date") || "").trim() || null,
    cover_image_url:
      String(formData.get("cover_image_url") || "").trim() || null,
    is_published: formData.get("is_published") === "on",
    sort_order: Number(formData.get("sort_order") || 0),
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("gallery_albums").update(payload).eq("id", id)
    : await supabase.from("gallery_albums").insert(payload);

  if (error) return { error: error.message };
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  return { success: id ? "Album updated." : "Album created." };
}

export async function deleteGalleryAlbumAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Unauthorized." };
  const id = String(formData.get("id") || "").trim();
  if (!id) return { error: "Missing id." };
  const supabase = await createClient();
  const { error } = await supabase.from("gallery_albums").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  return { success: "Album deleted." };
}

export async function addGalleryImageAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Unauthorized." };

  const albumId = String(formData.get("album_id") || "").trim();
  const mediaUrl = String(formData.get("media_url") || "").trim();
  if (!albumId || !mediaUrl) {
    return { error: "Album and image URL/file are required." };
  }

  const supabase = await createClient();
  const { data: maxRow } = await supabase
    .from("gallery_media")
    .select("sort_order")
    .eq("album_id", albumId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("gallery_media").insert({
    album_id: albumId,
    title: String(formData.get("title") || "").trim() || null,
    media_url: mediaUrl,
    caption: String(formData.get("caption") || "").trim() || null,
    media_type: "image",
    display_target: String(formData.get("display_target") || "grid").trim(),
    is_published: formData.get("is_published") !== "off",
    is_featured: formData.get("is_featured") === "on",
    sort_order: (maxRow?.sort_order ?? -1) + 1,
  });

  if (error) return { error: error.message };
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  return { success: "Image added." };
}

export async function reorderGalleryMediaAction(
  albumId: string,
  orderedIds: string[],
): Promise<ContentActionState> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Unauthorized." };

  const supabase = await createClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from("gallery_media")
        .update({ sort_order: index })
        .eq("id", id)
        .eq("album_id", albumId),
    ),
  );

  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  return { success: "Order saved." };
}

export async function updateGalleryMediaTargetAction(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth) return;
  const id = String(formData.get("id") || "");
  const target = String(formData.get("display_target") || "grid");
  if (!id) return;
  const supabase = await createClient();
  await supabase
    .from("gallery_media")
    .update({ display_target: target })
    .eq("id", id);
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

export async function setMemberStatusAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Unauthorized." };

  const applicationId = String(formData.get("application_id") || "");
  const memberStatus = String(formData.get("member_status") || "active");
  const statusNotes = String(formData.get("status_notes") || "").trim() || null;

  if (!applicationId) return { error: "Missing application." };

  const payload: Record<string, unknown> = {
    member_status: memberStatus,
    status_notes: statusNotes,
  };

  if (memberStatus === "left") {
    payload.left_at = new Date().toISOString();
    payload.status = "expired";
  } else if (memberStatus === "active") {
    payload.left_at = null;
    payload.status = "approved";
  } else if (memberStatus === "inactive" || memberStatus === "suspended") {
    payload.status = "expired";
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("membership_applications")
    .update(payload)
    .eq("id", applicationId);

  if (error) return { error: error.message };

  revalidatePath("/admin/members");
  revalidatePath("/admin/family");
  revalidatePath("/member");
  return { success: `Member marked as ${memberStatus}.` };
}

export async function upsertOrgNodeAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Unauthorized." };

  const id = String(formData.get("id") || "").trim() || null;
  const fullName = String(formData.get("full_name") || "").trim();
  const roleTitle = String(formData.get("role_title") || "").trim();
  if (!fullName || !roleTitle) {
    return { error: "Name and role are required." };
  }

  const parentRaw = String(formData.get("parent_id") || "").trim();
  const payload = {
    full_name: fullName,
    role_title: roleTitle,
    parent_id: parentRaw || null,
    avatar_url: String(formData.get("avatar_url") || "").trim() || null,
    profile_id: String(formData.get("profile_id") || "").trim() || null,
    sort_order: Number(formData.get("sort_order") || 0),
    is_active: formData.get("is_active") !== "off",
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("org_nodes").update(payload).eq("id", id)
    : await supabase.from("org_nodes").insert(payload);

  if (error) return { error: error.message };
  revalidatePath("/admin/family");
  revalidatePath("/about");
  return { success: id ? "Node updated." : "Node added." };
}

export async function deleteOrgNodeAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Unauthorized." };
  const id = String(formData.get("id") || "").trim();
  if (!id) return { error: "Missing id." };
  const supabase = await createClient();
  const { error } = await supabase.from("org_nodes").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/family");
  return { success: "Node removed." };
}

export async function upsertOrgNodeFormAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  return upsertOrgNodeAction(_prev, formData);
}

export async function addGalleryImageFormAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  return addGalleryImageAction(_prev, formData);
}

export async function setMemberStatusFormAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  return setMemberStatusAction(_prev, formData);
}
