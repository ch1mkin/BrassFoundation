import { cdnMediaUrl } from "@/lib/media/cdn";
import { cn } from "@/lib/utils";

type InstantImgProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "decoding"
> & {
  /** Prefer high for LCP / above-the-fold card images */
  priority?: boolean;
};

/**
 * Same-origin media via /api/media (Vercel CDN). No client JS required —
 * keeps first paint fast while avoiding direct supabase.co egress.
 */
export function InstantImg({
  className,
  priority = false,
  alt = "",
  src,
  loading,
  fetchPriority,
  ...props
}: InstantImgProps) {
  const resolved = typeof src === "string" ? cdnMediaUrl(src) : src;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      src={resolved}
      loading={loading ?? (priority ? "eager" : "lazy")}
      decoding="async"
      fetchPriority={
        fetchPriority ?? (priority ? "high" : "auto")
      }
      className={cn(className)}
      {...props}
    />
  );
}

/** Warm the browser cache for a short list of URLs (current + next slide). */
export function preloadImages(urls: (string | null | undefined)[]) {
  if (typeof window === "undefined") return;
  const seen = new Set<string>();
  let count = 0;
  for (const raw of urls) {
    if (count >= 2) break;
    const url = cdnMediaUrl(raw);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    count += 1;
    const img = new window.Image();
    img.decoding = "async";
    img.src = url;
  }
}
