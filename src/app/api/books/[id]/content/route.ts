import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  getApprovedPurchaseForBook,
  storagePathFromPublicUrl,
} from "@/lib/content/book-purchases";

type Params = { params: Promise<{ id: string }> };

/**
 * Entitlement-gated PDF access. Returns a short-lived signed URL when possible,
 * otherwise streams the file with no-store headers (never exposes permanent public URL to clients that lack approval).
 */
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing book id." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const purchase = await getApprovedPurchaseForBook(user.id, id);
  if (!purchase) {
    return NextResponse.json(
      { error: "You do not have access to this book." },
      { status: 403 },
    );
  }

  const admin = createServiceClient();
  const { data: item } = await admin
    .from("marketplace_items")
    .select("id, title, file_url")
    .eq("id", id)
    .maybeSingle();

  if (!item?.file_url) {
    return NextResponse.json({ error: "Book file missing." }, { status: 404 });
  }

  const path = storagePathFromPublicUrl(item.file_url, "marketplace");
  if (path) {
    const { data: signed, error } = await admin.storage
      .from("marketplace")
      .createSignedUrl(path, 120);
    if (!error && signed?.signedUrl) {
      return NextResponse.json({
        url: signed.signedUrl,
        purchaseId: purchase.id,
        title: item.title,
        watermark: {
          name: purchase.buyer_name,
          email: purchase.buyer_email,
          userId: user.id.slice(0, 8),
          purchaseId: purchase.id.slice(0, 8),
        },
      });
    }
  }

  // Fallback: proxy bytes (no-store)
  const fileRes = await fetch(item.file_url);
  if (!fileRes.ok) {
    return NextResponse.json({ error: "Could not load PDF." }, { status: 502 });
  }
  const bytes = await fileRes.arrayBuffer();
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store, max-age=0",
      "X-Purchase-Id": purchase.id,
    },
  });
}
