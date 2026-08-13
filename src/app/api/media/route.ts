import { NextRequest } from "next/server";
import { allowedStorageUrl, proxyStorageUrl } from "@/lib/media/proxy-response";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("u") || "";
  const target = allowedStorageUrl(raw);
  if (!target) {
    return new Response("Invalid media URL", { status: 400 });
  }

  return proxyStorageUrl(target.toString());
}
