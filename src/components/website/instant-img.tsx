"use client";

import { cn } from "@/lib/utils";

type InstantImgProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "loading" | "decoding"
> & {
  /** Prefer high for LCP / above-the-fold card images */
  priority?: boolean;
};

/**
 * Card/media images that fetch immediately instead of lazy-loading.
 * Always eager so swipe carousels and committee tiles don't pop in late.
 */
export function InstantImg({
  className,
  priority = false,
  alt = "",
  ...props
}: InstantImgProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      loading="eager"
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      className={cn(className)}
      {...props}
    />
  );
}

/** Warm the browser cache for a list of URLs (carousel slides, etc.). */
export function preloadImages(urls: (string | null | undefined)[]) {
  if (typeof window === "undefined") return;
  const seen = new Set<string>();
  for (const raw of urls) {
    const url = (raw || "").trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const img = new window.Image();
    img.decoding = "async";
    img.src = url;
  }
}
