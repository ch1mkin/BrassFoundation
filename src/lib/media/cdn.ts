/**
 * Serve Supabase Storage files through this app so browsers hit Vercel’s
 * CDN instead of supabase.co (cached egress).
 *
 * Prefer short path URLs (`/api/media/public/...`) — they cache more reliably
 * on the edge than huge `?u=` query strings.
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

export function cdnMediaUrl(url: string | null | undefined): string {
  const src = (url || "").trim();
  if (!src || src.startsWith("data:") || src.startsWith("blob:")) return src;
  if (src.startsWith("/")) return src;
  if (!isSupabaseStorageUrl(src)) return src;

  try {
    const parsed = new URL(src);
    const ours = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (ours) {
      try {
        if (new URL(ours).hostname !== parsed.hostname) return src;
      } catch {
        /* ignore */
      }
    }

    const marker = "/storage/v1/object/public/";
    const idx = parsed.pathname.indexOf(marker);
    if (idx !== -1) {
      const objectPath = decodeURIComponent(
        parsed.pathname.slice(idx + marker.length),
      );
      if (objectPath) {
        const segments = objectPath
          .split("/")
          .filter(Boolean)
          .map(encodeURIComponent)
          .join("/");
        return `/api/media/public/${segments}`;
      }
    }

    // Signed / transform URLs: keep query-param proxy.
    return `/api/media?u=${encodeURIComponent(src)}`;
  } catch {
    return src;
  }
}
