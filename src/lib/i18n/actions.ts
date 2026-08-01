"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canAccessAdmin, getUserContext } from "@/lib/auth/session";

export type TranslationActionState = {
  error?: string;
  success?: string;
};

export async function upsertTranslationAction(
  _prev: TranslationActionState,
  formData: FormData,
): Promise<TranslationActionState> {
  const context = await getUserContext();
  if (!context || !canAccessAdmin(context)) {
    return { error: "Unauthorized." };
  }

  const key = String(formData.get("key") || "").trim();
  const en = String(formData.get("en") || "").trim();
  const pa = String(formData.get("pa") || "").trim() || null;

  if (!key || !en) {
    return { error: "Key and English text are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("ui_translations").upsert({
    key,
    en,
    pa,
    updated_at: new Date().toISOString(),
    updated_by: context.userId,
  });

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/translations");
  return { success: `Saved ${key}` };
}
