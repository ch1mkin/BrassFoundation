import type { Metadata } from "next";
import { ResourceCreateForm } from "@/components/admin/resource-create-form";
import { deleteResourceAction } from "@/lib/content/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin · Resources" };

export default async function AdminResourcesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select("id, title, resource_type, file_url, external_url, is_published")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Resources</h1>
        <p className="mt-2 text-muted-foreground">
          Upload PDFs or paste URLs for the digital library.
        </p>
      </div>
      {error ? (
        <p className="glass-card rounded-2xl p-6 text-sm text-destructive">
          Run website content + uploads migrations. ({error.message})
        </p>
      ) : null}
      <div className="grid gap-8 lg:grid-cols-2">
        <ResourceCreateForm />
        <div className="space-y-3">
          {(data || []).map((row) => (
            <div key={row.id} className="glass-card rounded-2xl p-4">
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-medium">{row.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.resource_type}
                    {row.file_url ? " · file attached" : ""}
                  </p>
                </div>
                <form action={deleteResourceAction}>
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
