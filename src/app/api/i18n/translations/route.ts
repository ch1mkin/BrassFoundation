import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ui_translations")
      .select("key, en, pa");

    if (error) {
      return NextResponse.json({ translations: {} });
    }

    const translations: Record<string, { en: string; pa: string | null }> = {};
    for (const row of data || []) {
      translations[row.key] = { en: row.en, pa: row.pa };
    }
    return NextResponse.json({ translations });
  } catch {
    return NextResponse.json({ translations: {} });
  }
}
