import type { Metadata } from "next";
import { TranslationsAdmin } from "@/components/admin/translations-admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Translations" };

export default async function AdminTranslationsPage() {
  const supabase = await createClient();
  let rows: Array<{
    key: string;
    en: string;
    pa: string | null;
    hi?: string | null;
  }> = [];

  const withHi = await supabase
    .from("ui_translations")
    .select("key, en, pa, hi")
    .order("key");

  if (withHi.error) {
    const fallback = await supabase
      .from("ui_translations")
      .select("key, en, pa")
      .order("key");
    rows = (fallback.data || []).map((r) => ({ ...r, hi: null }));
  } else {
    rows = withHi.data || [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          English / Punjabi / Hindi translations
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Admin-authored Punjabi and Hindi are preferred for chrome. Empty
          fields fall back to Google Translate on the public site. Run{" "}
          <code>20260802040000_hindi_translations.sql</code> if the Hindi column
          is missing.
        </p>
      </div>
      <TranslationsAdmin rows={rows} />
    </div>
  );
}
