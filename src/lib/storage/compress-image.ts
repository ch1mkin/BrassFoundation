"use client";

const AVATAR_MAX_EDGE = 720;
const DEFAULT_MAX_EDGE = 1600;
const SKIP_UNDER_BYTES = 220_000;

function maxEdgeForBucket(bucket: string) {
  if (bucket === "avatars") return AVATAR_MAX_EDGE;
  return DEFAULT_MAX_EDGE;
}

/** Shrink photos before upload so Storage CDN is not serving 5–10MB originals. */
export async function compressImageForUpload(
  file: File,
  bucket: string,
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;
  if (file.size <= SKIP_UNDER_BYTES) return file;

  const maxEdge = maxEdgeForBucket(bucket);

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.78);
    });
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[a-z0-9]+$/i, ".jpg");
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file;
  }
}
