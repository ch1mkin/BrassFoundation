import type { Metadata } from "next";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { ResourceCreateForm } from "@/components/admin/resource-create-form";
import { getResourceCategory } from "@/lib/constants";
import { deleteResourceAction } from "@/lib/content/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin · Resources" };

export default async function AdminResourcesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select(
      "id, title, category, resource_type, file_url, external_url, is_published",
    )
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Resources</h1>
        <p className="mt-2 text-muted-foreground">
          Upload PDFs, audio, or paste URLs into a Digital Library category.
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
          {(data || []).length === 0 ? (
            <p className="glass-card rounded-2xl p-6 text-sm text-muted-foreground">
              No materials yet. Add one with a category on the left.
            </p>
          ) : null}
          {(data || []).map((row) => {
            const cat = getResourceCategory(row.category);
            return (
              <div key={row.id} className="glass-card rounded-2xl p-4">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-medium">{row.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {cat?.title || row.category} · {row.resource_type}
                      {row.file_url ? " · file attached" : ""}
                      {!row.is_published ? " · draft" : ""}
                    </p>
                  </div>
                  <AdminDeleteButton id={row.id} action={deleteResourceAction} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
