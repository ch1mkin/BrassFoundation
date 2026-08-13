const MAX_BYTES = 25 * 1024 * 1024;

/** Long-lived browser + Vercel CDN cache so repeat views skip Supabase Storage. */
export function mediaCacheHeaders(contentType: string, length?: number) {
  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set(
    "Cache-Control",
    "public, max-age=31536000, s-maxage=31536000, immutable",
  );
  headers.set(
    "CDN-Cache-Control",
    "public, s-maxage=31536000, immutable",
  );
  headers.set(
    "Vercel-CDN-Cache-Control",
    "public, s-maxage=31536000, immutable",
  );
  // Do NOT set Vary: Accept — it fragments the CDN cache and slows repeat views.
  headers.set("X-Content-Type-Options", "nosniff");
  if (length) headers.set("Content-Length", String(length));
  return headers;
}

export function supabasePublicObjectUrl(objectPath: string): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return null;
  const clean = objectPath
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
  if (!clean) return null;
  return `${base}/storage/v1/object/public/${clean}`;
}

export function allowedStorageUrl(raw: string): URL | null {
  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return null;
  }
  if (target.protocol !== "https:") return null;
  if (!target.hostname.endsWith(".supabase.co")) return null;

  const ours = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (ours) {
    try {
      if (new URL(ours).hostname !== target.hostname) return null;
    } catch {
      return null;
    }
  }

  const path = target.pathname;
  const ok =
    path.includes("/storage/v1/object/public/") ||
    path.includes("/storage/v1/render/image/");
  if (!ok) return null;
  return target;
}

export async function proxyStorageUrl(target: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      headers: { Accept: "image/*,application/pdf,video/*,audio/*,*/*" },
      // Edge HTTP cache + long CDN headers on our response = fast after first hit.
      cache: "force-cache",
      signal: controller.signal,
    });
  } catch {
    return new Response("Media upstream timeout", { status: 504 });
  } finally {
    clearTimeout(timer);
  }

  if (!upstream.ok || !upstream.body) {
    return new Response("Media not found", { status: upstream.status || 404 });
  }

  const length = Number(upstream.headers.get("content-length") || "0");
  if (length > MAX_BYTES) {
    return new Response("File too large to proxy", { status: 413 });
  }

  const contentType =
    upstream.headers.get("content-type") || "application/octet-stream";
  return new Response(upstream.body, {
    status: 200,
    headers: mediaCacheHeaders(contentType, length || undefined),
  });
}
