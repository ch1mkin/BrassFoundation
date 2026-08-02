import type { Metadata } from "next";
import { MustReadAdminPanel } from "@/components/admin/must-read-admin-panel";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin · Must Read" };

export default async function AdminMustReadPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("must_read_books")
    .select(
      "id, title, author, summary, cover_image_url, pdf_url, sort_order, is_published",
    )
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Must Read</h1>
        <p className="mt-2 text-muted-foreground">
          Books you must read — shown on the homepage with PDF links.
        </p>
      </div>
      {error ? (
        <p className="glass-card rounded-2xl p-6 text-sm text-destructive">
          Run <code>20260802020000_must_read_books.sql</code> in Supabase. (
          {error.message})
        </p>
      ) : null}
      <MustReadAdminPanel books={data || []} />
    </div>
  );
}
