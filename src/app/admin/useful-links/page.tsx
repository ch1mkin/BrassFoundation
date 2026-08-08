import type { Metadata } from "next";
import { UsefulLinksAdmin } from "@/components/admin/useful-links-admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin · Useful links" };

export default async function AdminUsefulLinksPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("useful_links")
    .select("id, title, url, description, is_published")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Useful links</h1>
        <p className="mt-2 text-muted-foreground">
          Links shown in the Resources section of the website.
        </p>
      </div>
      {error ? (
        <p className="text-sm text-destructive">
          Run migration 20260808200000… ({error.message})
        </p>
      ) : (
        <UsefulLinksAdmin rows={(data || []) as never} />
      )}
    </div>
  );
}
