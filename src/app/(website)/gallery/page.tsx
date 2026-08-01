import type { Metadata } from "next";
import { PublicGallery } from "@/components/website/public-gallery";
import { PageShell } from "@/components/website/page-shell";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const supabase = await createClient();
  const { data: albums } = await supabase
    .from("gallery_albums")
    .select("id, heading, title, description, display_mode")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  const { data: media } = await supabase
    .from("gallery_media")
    .select(
      "id, album_id, media_url, title, caption, display_target, sort_order",
    )
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  return (
    <PageShell
      eyebrow="Gallery"
      title="Moments of Impact"
      description="Event albums organized exactly as configured by the foundation team."
      wide
    >
      {!albums?.length ? (
        <div className="glass-card rounded-2xl p-10 text-center text-muted-foreground">
          No gallery albums yet. Admins can create headings and upload images
          from Admin → Gallery.
        </div>
      ) : (
        <PublicGallery
          albums={albums.map((a) => ({
            ...a,
            display_mode: a.display_mode || "grid",
          }))}
          media={(media || []).map((m) => ({
            ...m,
            display_target: m.display_target || "grid",
          }))}
        />
      )}
    </PageShell>
  );
}
