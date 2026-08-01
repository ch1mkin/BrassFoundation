import type { Metadata } from "next";
import { AdminContentForm } from "@/components/admin/content-form";
import { FileOrUrlField } from "@/components/admin/file-or-url-field";
import { GallerySortableGrid } from "@/components/admin/gallery-sortable";
import {
  addGalleryImageFormAction,
  deleteGalleryAlbumAction,
  upsertGalleryAlbumAction,
} from "@/lib/content/gallery-org-actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin · Gallery" };

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ album?: string }>;
}) {
  const { album: albumParam } = await searchParams;
  const supabase = await createClient();

  const { data: albums, error } = await supabase
    .from("gallery_albums")
    .select(
      "id, title, heading, slug, display_mode, event_date, is_published, sort_order",
    )
    .order("sort_order", { ascending: true });

  const selectedId = albumParam || albums?.[0]?.id || null;

  const { data: media } = selectedId
    ? await supabase
        .from("gallery_media")
        .select("id, title, media_url, display_target, sort_order")
        .eq("album_id", selectedId)
        .order("sort_order", { ascending: true })
    : { data: [] as Array<{
        id: string;
        title: string | null;
        media_url: string;
        display_target: string;
        sort_order: number;
      }> };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Gallery</h1>
        <p className="mt-2 text-muted-foreground">
          Create an album heading, upload images, choose slider or grid, then
          drag to organize how it appears on the website.
        </p>
      </div>

      {error ? (
        <p className="glass-card rounded-2xl p-6 text-sm text-destructive">
          Run <code>20260801050000_uploads_org_gallery.sql</code> (and website
          content migration). ({error.message})
        </p>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <AdminContentForm
            title="New album / event heading"
            action={upsertGalleryAlbumAction}
            fields={[
              { name: "title", label: "Album title", required: true },
              { name: "heading", label: "Public heading" },
              { name: "description", label: "Description", type: "textarea" },
              {
                name: "display_mode",
                label: "Layout (slider / grid / both)",
                defaultValue: "both",
              },
              { name: "event_date", label: "Event date", type: "text", placeholder: "YYYY-MM-DD" },
              {
                name: "is_published",
                label: "Published",
                type: "checkbox",
                defaultValue: true,
              },
            ]}
          />

          <div className="space-y-2">
            {(albums || []).map((album) => (
              <div
                key={album.id}
                className="glass-card flex items-center justify-between gap-2 rounded-xl p-3"
              >
                <a
                  href={`/admin/gallery?album=${album.id}`}
                  className={`text-sm font-medium ${selectedId === album.id ? "text-primary" : ""}`}
                >
                  {album.heading || album.title}
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {album.display_mode}
                  </span>
                </a>
                <form action={deleteGalleryAlbumAction}>
                  <input type="hidden" name="id" value={album.id} />
                  <button
                    type="submit"
                    className="text-xs font-semibold text-destructive"
                  >
                    Delete
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {selectedId ? (
            <>
              <form
                action={addGalleryImageFormAction}
                className="glass-card space-y-4 rounded-2xl p-6"
              >
                <h2 className="font-heading text-lg font-semibold">
                  Add image to album
                </h2>
                <input type="hidden" name="album_id" value={selectedId} />
                <input
                  name="title"
                  placeholder="Caption / title"
                  className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm"
                />
                <FileOrUrlField
                  name="media_url"
                  label="Image file or URL"
                  bucket="gallery"
                  accept="image/*"
                  folder={`albums/${selectedId}`}
                />
                <label className="block space-y-1 text-sm">
                  <span className="text-muted-foreground">Show in</span>
                  <select
                    name="display_target"
                    defaultValue="grid"
                    className="h-10 w-full rounded-xl border border-input bg-white px-3"
                  >
                    <option value="grid">Grid</option>
                    <option value="slider">Slider</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="is_published"
                    defaultChecked
                    className="size-4"
                  />
                  Published
                </label>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white"
                >
                  Add image
                </button>
              </form>

              <GallerySortableGrid
                albumId={selectedId}
                initialItems={(media || []).map((m) => ({
                  ...m,
                  display_target: m.display_target || "grid",
                }))}
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Create an album to start uploading images.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
