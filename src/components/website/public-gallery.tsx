"use client";

import { useEffect, useState } from "react";
import { InstantImg } from "@/components/website/instant-img";
import { cdnMediaUrl } from "@/lib/media/cdn";
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
  const [lightbox, setLightbox] = useState<Media | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  return (
    <div className="space-y-20">
      {albums.map((album) => {
        const items = media
          .filter((m) => m.album_id === album.id)
          .sort((a, b) => a.sort_order - b.sort_order);
        const slider = items.filter(
          (m) =>
            m.display_target === "slider" || album.display_mode === "slider",
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
          <section key={album.id} id={album.id} className="space-y-6">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                Album
              </p>
              <h2 className="font-heading mt-2 text-3xl font-semibold">
                {album.heading || album.title}
              </h2>
              {album.description ? (
                <p className="mt-3 text-muted-foreground">{album.description}</p>
              ) : null}
            </div>

            {showSlider && sliderItems.length > 0 ? (
              <AlbumSlider items={sliderItems} onOpen={setLightbox} />
            ) : null}

            {showGrid && gridItems.length > 0 ? (
              <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
                {gridItems.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLightbox(item)}
                    className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl text-left shadow-soft ring-1 ring-border/50 transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <InstantImg
                      src={item.media_url}
                      alt={item.title || item.caption || "Gallery"}
                      priority={i < 2}
                      className="w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                    {(item.title || item.caption) && (
                      <div className="absolute inset-x-0 bottom-0 p-3 text-sm text-white opacity-0 transition group-hover:opacity-100">
                        {item.title || item.caption}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : null}
          </section>
        );
      })}

      {lightbox ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 rounded-full bg-white/15 px-3 py-1 text-sm text-white"
            onClick={() => setLightbox(null)}
          >
            Close
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cdnMediaUrl(lightbox.media_url)}
            alt={lightbox.title || lightbox.caption || "Gallery"}
            className="max-h-[88vh] max-w-[94vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
}

function AlbumSlider({
  items,
  onOpen,
}: {
  items: Media[];
  onOpen: (item: Media) => void;
}) {
  const [index, setIndex] = useState(0);
  const current = items[index]!;

  useEffect(() => {
    if (items.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [items.length, index]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-black shadow-2xl">
      <button
        type="button"
        className="block w-full"
        onClick={() => onOpen(current)}
      >
        <InstantImg
          src={current.media_url}
          alt={current.title || current.caption || "Gallery"}
          priority
          className="aspect-[21/9] w-full object-cover sm:aspect-[2.4/1]"
        />
      </button>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 text-white">
        <p className="font-heading text-lg font-semibold">
          {current.title || current.caption || "Gallery moment"}
        </p>
      </div>
      {items.length > 1 ? (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "size-2 rounded-full",
                i === index ? "bg-gold" : "bg-white/40",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
