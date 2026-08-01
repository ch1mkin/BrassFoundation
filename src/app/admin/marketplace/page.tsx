import type { Metadata } from "next";
import { MarketplaceCreateForm } from "@/components/admin/marketplace-create-form";
import { deleteMarketplaceAction } from "@/lib/content/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin · Marketplace" };

export default async function AdminMarketplacePage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketplace_items")
    .select("id, title, author, price_label, file_url, is_published")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Marketplace</h1>
        <p className="mt-2 text-muted-foreground">
          Add books with cover images and PDF uploads or URLs.
        </p>
      </div>
      {error ? (
        <p className="glass-card rounded-2xl p-6 text-sm text-destructive">
          Run website content + uploads migrations. ({error.message})
        </p>
      ) : null}
      <div className="grid gap-8 lg:grid-cols-2">
        <MarketplaceCreateForm />
        <div className="space-y-3">
          {(data || []).map((row) => (
            <div key={row.id} className="glass-card rounded-2xl p-4">
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-medium">{row.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.author} · {row.price_label}
                    {row.file_url ? " · PDF" : ""}
                  </p>
                </div>
                <form action={deleteMarketplaceAction}>
                  <input type="hidden" name="id" value={row.id} />
                  <button
                    type="submit"
                    className="text-xs font-semibold text-destructive"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
