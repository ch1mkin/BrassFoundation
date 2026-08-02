"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canAccessAdmin, getUserContext } from "@/lib/auth/session";
import { ContentActionState, slugify } from "@/lib/content/utils";
import { sanitizeRichHtml } from "@/lib/security/html";

export async function upsertBlogAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const context = await getUserContext();
  if (!context || !canAccessAdmin(context)) {
    return { error: "Unauthorized." };
  }

  const id = String(formData.get("id") || "").trim() || null;
  const title = String(formData.get("title") || "").trim();
  const slug =
    String(formData.get("slug") || "").trim() || slugify(title);
  const bodyHtml = sanitizeRichHtml(
    String(formData.get("body_html") || "").trim(),
  );
  const isPublished =
    formData.get("is_published") === "on" ||
    formData.get("is_published") === "true";

  if (!title) return { error: "Title is required." };
  if (!bodyHtml || bodyHtml === "<p></p>") {
    return { error: "Write some blog content." };
  }

  const payload = {
    title,
    slug,
    excerpt: String(formData.get("excerpt") || "").trim() || null,
    body_html: bodyHtml,
    cover_image_url:
      String(formData.get("cover_image_url") || "").trim() || null,
    is_published: isPublished,
    is_featured: formData.get("is_featured") === "on",
    published_at: isPublished ? new Date().toISOString() : null,
    author_id: context.userId,
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("blog_posts").update(payload).eq("id", id)
    : await supabase.from("blog_posts").insert(payload);

  if (error) return { error: error.message };

  revalidatePath("/blog");
  revalidatePath("/admin/blogs");
  return { success: id ? "Blog updated." : "Blog published." };
}

export async function deleteBlogAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const context = await getUserContext();
  if (!context || !canAccessAdmin(context)) {
    return { error: "Unauthorized." };
  }
  const id = String(formData.get("id") || "").trim();
  if (!id) return { error: "Missing id." };
  const supabase = await createClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/blog");
  revalidatePath("/admin/blogs");
  return { success: "Blog deleted." };
}
