"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canAccessAdmin, getUserContext } from "@/lib/auth/session";
import type { ContentActionState } from "@/lib/content/utils";

async function requireAdmin() {
  const context = await getUserContext();
  if (!context || !canAccessAdmin(context)) return null;
  return context;
}

function revalidateCommittee() {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin/committee");
}

export async function upsertExecutiveMemberAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Unauthorized." };

  const id = String(formData.get("id") || "").trim() || null;
  const fullName = String(formData.get("full_name") || "").trim();
  const roleTitle = String(formData.get("role_title") || "").trim();
  if (!fullName || !roleTitle) {
    return { error: "Name and role are required." };
  }

  const payload = {
    full_name: fullName,
    role_title: roleTitle,
    photo_url: String(formData.get("photo_url") || "").trim() || null,
    sort_order: Number(formData.get("sort_order") || 0),
    is_published: formData.get("is_published") !== "off",
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("executive_committee").update(payload).eq("id", id)
    : await supabase.from("executive_committee").insert(payload);

  if (error) return { error: error.message };
  revalidateCommittee();
  return { success: id ? "Member updated." : "Member added." };
}

export async function upsertExecutiveMemberFormAction(formData: FormData) {
  await upsertExecutiveMemberAction({}, formData);
}

export async function deleteExecutiveMemberAction(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth) return;
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("executive_committee").delete().eq("id", id);
  revalidateCommittee();
}
