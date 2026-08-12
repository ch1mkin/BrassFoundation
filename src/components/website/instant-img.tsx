"use client";

import { cdnMediaUrl } from "@/lib/media/cdn";
import { cn } from "@/lib/utils";

type InstantImgProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "loading" | "decoding"
> & {
  /** Prefer high for LCP / above-the-fold card images */
  priority?: boolean;
};

/**
 * Card/media images. Supabase Storage URLs are rewritten through /api/media
 * so repeat views are served from Vercel instead of burning cached egress.
 */
export function InstantImg({
  className,
  priority = false,
  alt = "",
  src,
  ...props
}: InstantImgProps) {
  const resolved = typeof src === "string" ? cdnMediaUrl(src) : src;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      src={resolved}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
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
