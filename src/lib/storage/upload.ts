"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { canAccessAdmin, getUserContext } from "@/lib/auth/session";

export type UploadBucket = "gallery" | "resources" | "marketplace" | "avatars";

export type UploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; error: string };

function extFromName(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "bin";
}

export async function uploadAdminFile(
  bucket: UploadBucket,
  file: File,
  folder = "uploads",
): Promise<UploadResult> {
  const context = await getUserContext();
  if (!context || !canAccessAdmin(context)) {
    return { ok: false, error: "Unauthorized." };
  }

  if (!file || file.size === 0) {
    return { ok: false, error: "No file selected." };
  }

  const ext = extFromName(file.name);
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  try {
    const admin = createServiceClient();
    const { error } = await admin.storage.from(bucket).upload(path, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (error) return { ok: false, error: error.message };

    const { data } = admin.storage.from(bucket).getPublicUrl(path);
    return { ok: true, url: data.publicUrl, path };
  } catch {
    // Fall back to user session client if service role is missing
    const supabase = await createClient();
    const { error } = await supabase.storage.from(bucket).upload(path, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (error) {
      return {
        ok: false,
        error:
          error.message.includes("Bucket not found")
            ? "Storage buckets are missing. Run 20260801050000_uploads_org_gallery.sql in Supabase."
            : error.message,
      };
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return { ok: true, url: data.publicUrl, path };
  }
}
