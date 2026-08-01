import type { Metadata } from "next";
import { AdminContentForm } from "@/components/admin/content-form";
import {
  deleteResourceAction,
  upsertResourceAction,
} from "@/lib/content/actions";
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
          Digital library items with download or external links.
        </p>
      </div>
      {error ? (
        <p className="glass-card rounded-2xl p-6 text-sm text-destructive">
          Run website content migration. ({error.message})
        </p>
      ) : null}
      <div className="grid gap-8 lg:grid-cols-2">
        <AdminContentForm
          title="Add resource"
          action={upsertResourceAction}
          fields={[
            { name: "title", label: "Title", required: true },
            { name: "subtitle", label: "Subtitle" },
            { name: "description", label: "Description", type: "textarea" },
            { name: "resource_type", label: "Type (pdf/video/audio/link)", defaultValue: "pdf" },
            { name: "file_url", label: "File URL", type: "url" },
            { name: "external_url", label: "External URL", type: "url" },
            { name: "file_size_label", label: "Size label", placeholder: "12MB" },
            { name: "icon", label: "Icon", defaultValue: "menu_book" },
            { name: "tone", label: "Tone", defaultValue: "primary" },
            { name: "sort_order", label: "Sort order", type: "number", defaultValue: 0 },
            { name: "is_published", label: "Published", type: "checkbox", defaultValue: true },
          ]}
        />
        <div className="space-y-3">
          {(data || []).map((row) => (
            <div key={row.id} className="glass-card rounded-2xl p-4">
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-medium">{row.title}</p>
                  <p className="text-xs text-muted-foreground">{row.resource_type}</p>
                </div>
                <form action={deleteResourceAction}>
                  <input type="hidden" name="id" value={row.id} />
                  <button type="submit" className="text-xs font-semibold text-destructive">
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
