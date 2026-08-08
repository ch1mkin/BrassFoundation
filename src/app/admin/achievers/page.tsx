import type { Metadata } from "next";
import { AchieversAdmin } from "@/components/admin/achievers-admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin · Achievers" };

export default async function AdminAchieversPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("achievers")
    .select("id, full_name, age, photo_url, achievement, sort_order, is_published")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Achievers</h1>
        <p className="mt-2 text-muted-foreground">
          Crowns appear on circular photos on the public Achievers page.
        </p>
      </div>
      {error ? (
        <p className="text-sm text-destructive">
          Run migration 20260808200000_referrals_achievers_brochure_family.sql ({error.message})
        </p>
      ) : (
        <AchieversAdmin rows={(data || []) as never} />
      )}
    </div>
  );
}
