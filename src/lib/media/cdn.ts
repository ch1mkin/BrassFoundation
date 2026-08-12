/**
 * Serve Supabase Storage files through this app so browsers hit Vercel’s
 * CDN instead of supabase.co (cached egress).
 */
export function isSupabaseStorageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    if (!parsed.hostname.endsWith(".supabase.co")) return false;
    return (
      parsed.pathname.includes("/storage/v1/object/public/") ||
      parsed.pathname.includes("/storage/v1/object/sign/") ||
      parsed.pathname.includes("/storage/v1/render/image/")
    );
  } catch {
    return false;
  }
}

export function cdnMediaUrl(
  url: string | null | undefined,
): string {
  const src = (url || "").trim();
  if (!src || src.startsWith("data:") || src.startsWith("blob:")) return src;
  if (src.startsWith("/")) return src;
  if (!isSupabaseStorageUrl(src)) return src;
  return `/api/media?u=${encodeURIComponent(src)}`;
}
