import { NextRequest } from "next/server";

export const runtime = "nodejs";

const MAX_BYTES = 25 * 1024 * 1024;

function allowedStorageUrl(raw: string): URL | null {
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

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("u") || "";
  const target = allowedStorageUrl(raw);
  if (!target) {
    return new Response("Invalid media URL", { status: 400 });
  }

  const upstream = await fetch(target.toString(), {
    headers: { Accept: "image/*,application/pdf,video/*,audio/*,*/*" },
    cache: "force-cache",
    next: { revalidate: 60 * 60 * 24 * 30 },
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("Media not found", { status: upstream.status || 404 });
  }

  const length = Number(upstream.headers.get("content-length") || "0");
  if (length > MAX_BYTES) {
    return new Response("File too large to proxy", { status: 413 });
  }

  const contentType =
    upstream.headers.get("content-type") || "application/octet-stream";
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
  if (length) headers.set("Content-Length", String(length));

  return new Response(upstream.body, { status: 200, headers });
}
