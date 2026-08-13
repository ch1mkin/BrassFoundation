import { supabasePublicObjectUrl, proxyStorageUrl } from "@/lib/media/proxy-response";

export const runtime = "edge";

type Params = { params: Promise<{ path: string[] }> };

/**
 * Path-based proxy: /api/media/public/{bucket}/...object
 * Cached on Vercel CDN so browsers rarely hit Supabase Storage (cached egress).
 */
export async function GET(_request: Request, { params }: Params) {
  const { path } = await params;
  if (!path?.length) {
    return new Response("Missing path", { status: 400 });
  }

  const target = supabasePublicObjectUrl(path.join("/"));
  if (!target) {
    return new Response("Storage not configured", { status: 500 });
  }

  return proxyStorageUrl(target);
}
