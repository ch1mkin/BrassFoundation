import type { Metadata } from "next";
import { PageShell } from "@/components/website/page-shell";
import { getFeaturedGallery } from "@/lib/content/queries";

export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const media = await getFeaturedGallery(24);

  return (
    <PageShell
      eyebrow="Gallery"
      title="Moments of Impact"
      description="Community programs, camps, and celebrations — add images from the admin gallery."
      wide
    >
      {media.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-muted-foreground">
          No gallery images yet. Add media URLs from{" "}
          <span className="font-medium text-foreground">Admin → Gallery</span>{" "}
          after running the website content migration.
        </div>
      ) : (
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
          {media.map((item) => (
            <figure key={item.id} className="mb-6 break-inside-avoid">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.media_url}
                alt={item.title || item.caption || "Gallery image"}
                className="w-full rounded-2xl object-cover"
              />
              {item.caption || item.title ? (
                <figcaption className="mt-2 text-sm text-muted-foreground">
                  {item.caption || item.title}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      )}
    </PageShell>
  );
}
