import type { Metadata } from "next";
import { TranslationsAdmin } from "@/components/admin/translations-admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Translations" };

export default async function AdminTranslationsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ui_translations")
    .select("key, en, pa")
    .order("key");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          English / Punjabi translations
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Admin-authored Punjabi is preferred. Empty Punjabi fields fall back to
          Google Translate on the public site.
        </p>
      </div>
      <TranslationsAdmin rows={data || []} />
    </div>
  );
}
