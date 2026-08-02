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
  const hi = String(formData.get("hi") || "").trim() || null;

  if (!key || !en) {
    return { error: "Key and English text are required." };
  }

  const supabase = await createClient();
  const payload: Record<string, unknown> = {
    key,
    en,
    pa,
    updated_at: new Date().toISOString(),
    updated_by: context.userId,
  };
  // Include hi when the column exists (migration applied)
  payload.hi = hi;

  const { error } = await supabase.from("ui_translations").upsert(payload);

  if (error) {
    if (/column .*hi.* does not exist/i.test(error.message)) {
      delete payload.hi;
      const retry = await supabase.from("ui_translations").upsert(payload);
      if (retry.error) return { error: retry.error.message };
      return {
        success: `Saved ${key} (run Hindi migration to store हिन्दी).`,
      };
    }
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/translations");
  return { success: `Saved ${key}` };
}
