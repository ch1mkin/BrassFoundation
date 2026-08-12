"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { InstantImg } from "@/components/website/instant-img";
import { MaterialIcon } from "@/components/ui/material-icon";
import type { ResourceCategoryRow } from "@/lib/content/resource-categories";
import type { ResourceRow } from "@/lib/content/queries";
import { cdnMediaUrl } from "@/lib/media/cdn";
import { cn } from "@/lib/utils";

const TYPE_FILTERS = [
  { id: "all", label: "All types" },
  { id: "pdf", label: "PDF" },
  { id: "audio", label: "Audio" },
  { id: "video", label: "Video" },
  { id: "link", label: "Link" },
  { id: "other", label: "Other" },
] as const;

const toneClass = {
  primary: "text-primary",
  secondary: "text-secondary",
  tertiary: "text-tertiary",
  brand: "text-brand",
} as const;

export function ResourceCategoryBrowser({
  categorySlug,
  categories,
  resources,
}: {
  categorySlug: string;
  categories: ResourceCategoryRow[];
  resources: ResourceRow[];
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<(typeof TYPE_FILTERS)[number]["id"]>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter((item) => {
      if (type !== "all" && item.resource_type !== type) return false;
      if (!q) return true;
      const hay = [item.title, item.subtitle, item.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [resources, query, type]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="notranslate flex flex-wrap gap-2"
          role="navigation"
          aria-label="Library categories"
        >
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/resources/${cat.slug}`}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition sm:text-sm",
                cat.slug === categorySlug
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              {cat.title}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative block min-w-[14rem] flex-1">
            <span className="sr-only">Search materials</span>
            <MaterialIcon
              name="search"
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[18px] text-muted-foreground"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search materials…"
              className="h-10 w-full rounded-xl border border-input bg-white pr-3 pl-10 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <label className="block">
            <span className="sr-only">Filter by type</span>
            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value as (typeof TYPE_FILTERS)[number]["id"])
              }
              className="h-10 rounded-xl border border-input bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            >
              {TYPE_FILTERS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center">
          <MaterialIcon
            name="folder_open"
            className="mx-auto text-4xl text-muted-foreground"
          />
          <p className="mt-3 font-heading text-lg font-semibold">
            No materials found
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {resources.length === 0
              ? "Nothing has been uploaded to this category yet."
              : "Try a different search or type filter."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const href = item.file_url
              ? cdnMediaUrl(item.file_url)
              : item.external_url;
            const tone =
              item.tone in toneClass
                ? (item.tone as keyof typeof toneClass)
                : "primary";
            return (
              <article key={item.id} className="glass-card rounded-2xl p-5">
                <div
                  className={cn(
                    "mb-4 flex aspect-[4/5] items-center justify-center overflow-hidden rounded-xl bg-surface-highest",
                    !item.thumbnail_url && toneClass[tone],
                  )}
                >
                  {item.thumbnail_url ? (
                    <InstantImg
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <MaterialIcon
                      name={item.icon || "menu_book"}
                      className="text-5xl"
                    />
                  )}
                </div>
                <h2 className="font-heading text-lg font-semibold">
                  {item.title}
                </h2>
                {item.subtitle ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.subtitle}
                  </p>
                ) : null}
                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-muted px-2 py-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                      {item.resource_type}
                    </span>
                    {item.file_size_label ? (
                      <span
                        className="notranslate rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary"
                        translate="no"
                      >
                        {item.file_size_label}
                      </span>
                    ) : null}
                  </div>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
                      aria-label={`Open ${item.title}`}
                    >
                      <MaterialIcon name="download" className="text-[20px]" />
                      Open
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <MaterialIcon name="lock" className="text-[18px]" />
                      Soon
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
