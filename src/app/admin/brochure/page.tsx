import type { Metadata } from "next";
import { BrochureAdmin } from "@/components/admin/brochure-admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin · Brochure" };

export default async function AdminBrochurePage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organisation_brochures")
    .select("id, title, description, file_url, cover_image_url, is_published")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Brochure</h1>
        <p className="mt-2 text-muted-foreground">
          Upload the organisation brochure shown on the public Brochure page.
        </p>
      </div>
      {error ? (
        <p className="text-sm text-destructive">
          Run migration 20260808200000_referrals_achievers_brochure_family.sql ({error.message})
        </p>
      ) : (
        <BrochureAdmin rows={(data || []) as never} />
      )}
    </div>
  );
}
