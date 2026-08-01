import type { Metadata } from "next";
import { AdminContentForm } from "@/components/admin/content-form";
import {
  addGalleryMediaAction,
  deleteGalleryMediaAction,
} from "@/lib/content/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin · Gallery" };

export default async function AdminGalleryPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_media")
    .select("id, title, media_url, caption, is_published, is_featured")
    .order("sort_order", { ascending: true })
    .limit(100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Gallery</h1>
        <p className="mt-2 text-muted-foreground">
          Add image URLs for the public gallery (storage uploads come later).
        </p>
      </div>
      {error ? (
        <p className="glass-card rounded-2xl p-6 text-sm text-destructive">
          Run website content migration. ({error.message})
        </p>
      ) : null}
      <div className="grid gap-8 lg:grid-cols-2">
        <AdminContentForm
          title="Add media"
          action={addGalleryMediaAction}
          fields={[
            { name: "title", label: "Title" },
            { name: "media_url", label: "Image URL", type: "url", required: true },
            { name: "caption", label: "Caption" },
            { name: "media_type", label: "Type", defaultValue: "image" },
            { name: "is_published", label: "Published", type: "checkbox", defaultValue: true },
            { name: "is_featured", label: "Featured", type: "checkbox", defaultValue: true },
          ]}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {(data || []).map((row) => (
            <div key={row.id} className="glass-card overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={row.media_url}
                alt={row.title || "Gallery"}
                className="h-32 w-full object-cover"
              />
              <div className="flex items-center justify-between gap-2 p-3">
                <p className="truncate text-xs font-medium">
                  {row.title || row.caption || "Untitled"}
                </p>
                <form action={deleteGalleryMediaAction}>
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
