import type { Metadata } from "next";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { AdminLockedForm } from "@/components/admin/admin-locked-form";
import { AlbumEditor } from "@/components/admin/album-editor";
import { FileOrUrlField } from "@/components/admin/file-or-url-field";
import { GallerySortableGrid } from "@/components/admin/gallery-sortable";
import {
  addGalleryImageFormAction,
  deleteGalleryAlbumAction,
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
      "id, title, heading, description, slug, display_mode, event_date, is_published, sort_order",
    )
    .order("sort_order", { ascending: true });

  const selectedId = albumParam || albums?.[0]?.id || null;
  const selected = albums?.find((a) => a.id === selectedId) || null;

  const { data: media } = selectedId
    ? await supabase
        .from("gallery_media")
        .select("id, title, media_url, display_target, sort_order")
        .eq("album_id", selectedId)
        .order("sort_order", { ascending: true })
    : {
        data: [] as Array<{
          id: string;
          title: string | null;
          media_url: string;
          display_target: string;
          sort_order: number;
        }>,
      };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Gallery</h1>
        <p className="mt-2 text-muted-foreground">
          Create and edit album headings, upload images, choose slider or grid,
          then drag to organize how it appears on the website.
        </p>
      </div>

      {error ? (
        <p className="glass-card rounded-2xl p-6 text-sm text-destructive">
          Run gallery migrations in Supabase. ({error.message})
        </p>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <AlbumEditor
            album={
              selected
                ? {
                    id: selected.id,
                    title: selected.title,
                    heading: selected.heading,
                    description: selected.description,
                    display_mode: selected.display_mode || "grid",
                    event_date: selected.event_date,
                    is_published: selected.is_published,
                    sort_order: selected.sort_order,
                  }
                : null
            }
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
                <AdminDeleteButton
                  id={album.id}
                  action={deleteGalleryAlbumAction}
                  label="Delete"
                  pendingLabel="Deleting album…"
                  confirmMessage={`Delete album “${album.heading || album.title}”? This cannot be undone.`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {selectedId ? (
            <>
              <div className="glass-card space-y-4 rounded-2xl p-6">
                <h2 className="font-heading text-lg font-semibold">
                  Add image to album
                </h2>
                <AdminLockedForm
                  action={addGalleryImageFormAction}
                  submitLabel="Add image"
                  className="space-y-4"
                >
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
                </AdminLockedForm>
              </div>

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
