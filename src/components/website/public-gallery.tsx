"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Album = {
  id: string;
  heading: string | null;
  title: string;
  description: string | null;
  display_mode: string;
};

type Media = {
  id: string;
  album_id: string | null;
  media_url: string;
  title: string | null;
  caption: string | null;
  display_target: string;
  sort_order: number;
};

export function PublicGallery({
  albums,
  media,
}: {
  albums: Album[];
  media: Media[];
}) {
  return (
    <div className="space-y-16">
      {albums.map((album) => {
        const items = media
          .filter((m) => m.album_id === album.id)
          .sort((a, b) => a.sort_order - b.sort_order);
        const slider = items.filter(
          (m) =>
            m.display_target === "slider" ||
            album.display_mode === "slider",
        );
        const grid = items.filter(
          (m) =>
            m.display_target === "grid" ||
            album.display_mode === "grid" ||
            album.display_mode === "both",
        );
        const showSlider =
          album.display_mode === "slider" ||
          album.display_mode === "both" ||
          slider.length > 0;
        const showGrid =
          album.display_mode === "grid" ||
          album.display_mode === "both" ||
          grid.some((g) => g.display_target === "grid");

        const sliderItems =
          album.display_mode === "slider"
            ? items
            : slider.length
              ? slider
              : [];
        const gridItems =
          album.display_mode === "grid"
            ? items
            : grid.filter((g) => g.display_target === "grid");

        return (
          <section key={album.id} id={album.id}>
            <h2 className="font-heading text-2xl font-semibold">
              {album.heading || album.title}
            </h2>
            {album.description ? (
              <p className="mt-2 max-w-2xl text-muted-foreground">
                {album.description}
              </p>
            ) : null}

            {showSlider && sliderItems.length > 0 ? (
              <AlbumSlider items={sliderItems} />
            ) : null}

            {showGrid && gridItems.length > 0 ? (
              <div className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3">
                {gridItems.map((item) => (
                  <figure key={item.id} className="mb-4 break-inside-avoid">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.media_url}
                      alt={item.title || item.caption || "Gallery"}
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
            ) : null}

            {!items.length ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No images in this album yet.
              </p>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

function AlbumSlider({ items }: { items: Media[] }) {
  const [index, setIndex] = useState(0);
  const current = items[index];

  if (!current) return null;

  return (
    <div className="mt-6">
      <div className="relative overflow-hidden rounded-2xl bg-surface-high">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.media_url}
          alt={current.title || "Slide"}
          className="max-h-[480px] w-full object-contain"
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          className="rounded-full border border-border px-3 py-1 text-sm"
          onClick={() =>
            setIndex((i) => (i - 1 + items.length) % items.length)
          }
        >
          Prev
        </button>
        <div className="flex gap-1.5">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "size-2 rounded-full",
                i === index ? "bg-primary" : "bg-border",
              )}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <button
          type="button"
          className="rounded-full border border-border px-3 py-1 text-sm"
          onClick={() => setIndex((i) => (i + 1) % items.length)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
