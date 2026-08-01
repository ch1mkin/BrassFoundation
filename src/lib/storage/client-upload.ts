"use client";

import { createClient } from "@/lib/supabase/client";

export type UploadBucket = "gallery" | "resources" | "marketplace" | "avatars";

export type ClientUploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; error: string };

function extFromName(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "bin";
}

/** Upload directly from the browser (avoids Vercel server-action File crashes). */
export async function uploadFileClient(
  bucket: UploadBucket,
  file: File,
  folder = "uploads",
): Promise<ClientUploadResult> {
  if (!file || file.size === 0) {
    return { ok: false, error: "No file selected." };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { ok: false, error: "Image must be under 10MB." };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anon) {
    return { ok: false, error: "Supabase is not configured in this environment." };
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, error: "Please sign in again, then retry the upload." };
    }

    const ext = extFromName(file.name);
    const safeExt = ["jpg", "jpeg", "png", "webp", "gif", "pdf"].includes(ext)
      ? ext
      : file.type.startsWith("image/")
        ? "jpg"
        : "bin";
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

    const contentType =
      file.type ||
      (safeExt === "pdf" ? "application/pdf" : `image/${safeExt === "jpg" ? "jpeg" : safeExt}`);

    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      contentType,
      upsert: false,
      cacheControl: "3600",
    });

    if (error) {
      const msg = error.message || "Upload failed.";
      if (/bucket not found/i.test(msg)) {
        return {
          ok: false,
          error:
            "Storage bucket missing. Run supabase/migrations/20260801050000_uploads_org_gallery.sql in Supabase.",
        };
      }
      if (/mime|not allowed|invalid/i.test(msg)) {
        return {
          ok: false,
          error: "File type not allowed. Use JPG, PNG, WEBP, or GIF.",
        };
      }
      return { ok: false, error: msg };
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    if (!data?.publicUrl) {
      return { ok: false, error: "Upload succeeded but public URL was empty." };
    }

    return { ok: true, url: data.publicUrl, path };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Upload failed unexpectedly.",
    };
  }
}
