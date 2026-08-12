"use server";

import { revalidatePath, unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { bustPublicCmsCache, PUBLIC_CMS_TAG } from "@/lib/cache/public";
import { canAccessAdmin, getUserContext } from "@/lib/auth/session";
import type { ContentActionState } from "@/lib/content/utils";

async function requireAdmin() {
  const context = await getUserContext();
  if (!context || !canAccessAdmin(context)) return null;
  return context;
}

function revalidateMustRead() {
  bustPublicCmsCache();
  revalidatePath("/");
  revalidatePath("/must-read");
  revalidatePath("/admin/must-read");
}

export type MustReadBook = {
  id: string;
  title: string;
  author: string | null;
  summary: string | null;
  cover_image_url: string | null;
  pdf_url: string;
  sort_order: number;
  is_published: boolean;
};

export const getPublishedMustReadBooks = unstable_cache(
  async (): Promise<MustReadBook[]> => {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("must_read_books")
      .select(
        "id, title, author, summary, cover_image_url, pdf_url, sort_order, is_published",
      )
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    if (error) return [];
    return (data || []) as MustReadBook[];
  } catch {
    return [];
  }
  },
  ["published-must-read"],
  { revalidate: 120, tags: [PUBLIC_CMS_TAG] },
);

export async function upsertMustReadBookAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Unauthorized." };

  const id = String(formData.get("id") || "").trim() || null;
  const title = String(formData.get("title") || "").trim();
  const pdfUrl = String(formData.get("pdf_url") || "").trim();
  if (!title) return { error: "Title is required." };
  if (!pdfUrl) return { error: "PDF link or upload is required." };

  const payload = {
    title,
    author: String(formData.get("author") || "").trim() || null,
    summary: String(formData.get("summary") || "").trim() || null,
    cover_image_url:
      String(formData.get("cover_image_url") || "").trim() || null,
    pdf_url: pdfUrl,
    sort_order: Number(formData.get("sort_order") || 0),
    is_published:
      formData.get("is_published") === "on" ||
      formData.get("is_published") === "true",
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("must_read_books").update(payload).eq("id", id)
    : await supabase.from("must_read_books").insert(payload);

  if (error) {
    if (/relation .* does not exist/i.test(error.message)) {
      return {
        error:
          "Run supabase/migrations/20260802020000_must_read_books.sql in Supabase.",
      };
    }
    return { error: error.message };
  }

  revalidateMustRead();
  return { success: id ? "Book updated." : "Book added." };
}

export async function deleteMustReadBookAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Unauthorized." };
  const id = String(formData.get("id") || "").trim();
  if (!id) return { error: "Missing id." };
  const supabase = await createClient();
  const { error } = await supabase.from("must_read_books").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidateMustRead();
  return { success: "Book removed." };
}
