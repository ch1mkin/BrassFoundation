import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";

export type BookPurchaseStatus =
  | "pending_payment"
  | "paid_awaiting_approval"
  | "approved"
  | "rejected";

export type BookPurchaseRow = {
  id: string;
  user_id: string;
  marketplace_item_id: string;
  payment_order_id: string | null;
  status: BookPurchaseStatus;
  buyer_name: string | null;
  buyer_email: string | null;
  buyer_phone: string | null;
  paid_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
  admin_note: string | null;
  created_at: string;
};

export type BookPurchaseWithItem = BookPurchaseRow & {
  marketplace_items: {
    id: string;
    slug: string;
    title: string;
    author: string | null;
    summary: string | null;
    cover_image_url: string | null;
    price_label: string;
    price_paise: number | null;
  } | null;
};

/** Parse ₹399 / 399 into paise */
export function priceLabelToPaise(label: string | null | undefined): number | null {
  if (!label) return null;
  const digits = label.replace(/[^\d.]/g, "");
  if (!digits) return null;
  const rupees = Number(digits);
  if (!Number.isFinite(rupees) || rupees <= 0) return null;
  return Math.round(rupees * 100);
}

export function resolveBookPricePaise(item: {
  price_paise?: number | null;
  price_label?: string | null;
}): number | null {
  if (item.price_paise && item.price_paise > 0) return item.price_paise;
  return priceLabelToPaise(item.price_label);
}

export async function getUserBookPurchaseMap(
  userId: string,
): Promise<Record<string, BookPurchaseStatus>> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("book_purchases")
      .select("marketplace_item_id, status")
      .eq("user_id", userId)
      .in("status", ["paid_awaiting_approval", "approved"]);
    const map: Record<string, BookPurchaseStatus> = {};
    for (const row of data || []) {
      map[row.marketplace_item_id] = row.status as BookPurchaseStatus;
    }
    return map;
  } catch {
    return {};
  }
}

export async function getMemberBookLibrary(
  userId: string,
): Promise<BookPurchaseWithItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("book_purchases")
      .select(
        `id, user_id, marketplace_item_id, payment_order_id, status,
         buyer_name, buyer_email, buyer_phone, paid_at, approved_at,
         approved_by, admin_note, created_at,
         marketplace_items ( id, slug, title, author, summary, cover_image_url, price_label, price_paise )`,
      )
      .eq("user_id", userId)
      .in("status", ["approved", "paid_awaiting_approval"])
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as unknown as BookPurchaseWithItem[];
  } catch {
    return [];
  }
}

export async function getApprovedPurchaseForBook(
  userId: string,
  marketplaceItemId: string,
): Promise<BookPurchaseRow | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("book_purchases")
      .select("*")
      .eq("user_id", userId)
      .eq("marketplace_item_id", marketplaceItemId)
      .eq("status", "approved")
      .maybeSingle();
    return (data as BookPurchaseRow) || null;
  } catch {
    return null;
  }
}

export async function getPendingBookPurchasesForAdmin() {
  const admin = createServiceClient();
  const { data, error } = await admin
    .from("book_purchases")
    .select(
      `id, user_id, marketplace_item_id, payment_order_id, status,
       buyer_name, buyer_email, buyer_phone, paid_at, approved_at,
       approved_by, admin_note, created_at,
       marketplace_items ( id, slug, title, author, price_label, cover_image_url )`,
    )
    .eq("status", "paid_awaiting_approval")
    .order("paid_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

export function storagePathFromPublicUrl(
  url: string,
  bucket: string,
): string | null {
  const marker = `/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length).split("?")[0]);
}
