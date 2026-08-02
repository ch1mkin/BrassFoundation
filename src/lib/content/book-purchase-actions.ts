"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canAccessAdmin, getUserContext } from "@/lib/auth/session";
import type { ContentActionState } from "@/lib/content/utils";

export async function confirmBookPurchaseAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const context = await getUserContext();
  if (!context || !canAccessAdmin(context)) {
    return { error: "Unauthorized." };
  }

  const id = String(formData.get("id") || "").trim();
  if (!id) return { error: "Missing purchase id." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("book_purchases")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: context.userId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "paid_awaiting_approval")
    .select("marketplace_item_id, user_id")
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: "Purchase not found or already processed." };

  revalidatePath("/admin/book-purchases");
  revalidatePath("/admin/marketplace");
  revalidatePath("/member/books");
  revalidatePath("/marketplace");
  revalidatePath("/");
  return { success: "Purchase confirmed. Book unlocked for the member." };
}

export async function rejectBookPurchaseAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const context = await getUserContext();
  if (!context || !canAccessAdmin(context)) {
    return { error: "Unauthorized." };
  }

  const id = String(formData.get("id") || "").trim();
  const note = String(formData.get("admin_note") || "").trim() || null;
  if (!id) return { error: "Missing purchase id." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("book_purchases")
    .update({
      status: "rejected",
      admin_note: note,
      approved_by: context.userId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "paid_awaiting_approval");

  if (error) return { error: error.message };

  revalidatePath("/admin/book-purchases");
  revalidatePath("/member/books");
  revalidatePath("/marketplace");
  return { success: "Purchase rejected." };
}
