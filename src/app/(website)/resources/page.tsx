import type { Metadata } from "next";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";
import { InstantImg } from "@/components/website/instant-img";
import { PageShell } from "@/components/website/page-shell";
import { getResourceCategoryCounts } from "@/lib/content/queries";
import { getResourceCategories } from "@/lib/content/resource-categories";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Digital Library" };

const toneClass = {
  primary: "text-primary group-hover:bg-primary group-hover:text-white",
  secondary: "text-secondary group-hover:bg-secondary group-hover:text-white",
  tertiary: "text-tertiary group-hover:bg-tertiary group-hover:text-white",
  brand: "text-brand group-hover:bg-brand group-hover:text-brand-foreground",
} as const;

export default async function ResourcesPage() {
  const [categories, counts] = await Promise.all([
    getResourceCategories(),
    getResourceCategoryCounts(),
  ]);

  return (
    <PageShell
      eyebrow="Resources"
      title="Digital Library & Resources"
      description="Browse library categories — Constitution texts, writings, kits, podcasts, and more."
      wide
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        {categories.map((item) => {
          const count = counts[item.slug] ?? 0;
          const tone =
            item.tone in toneClass
              ? (item.tone as keyof typeof toneClass)
              : "primary";
          return (
            <Link
              key={item.slug}
              href={`/resources/${item.slug}`}
              className="glass-card group rounded-xl p-3 transition hover:-translate-y-0.5 sm:rounded-2xl sm:p-5"
            >
              <div
                className={cn(
                  "mb-2 flex aspect-[5/4] items-center justify-center overflow-hidden rounded-lg bg-surface-highest transition-all duration-300 sm:mb-4 sm:aspect-[4/5] sm:rounded-xl",
                  !item.thumbnail_url && toneClass[tone],
                )}
              >
                {item.thumbnail_url ? (
                  <InstantImg
                    src={item.thumbnail_url}
                    alt=""
                    className="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <MaterialIcon
                    name={item.icon}
                    className="text-3xl sm:text-5xl"
                  />
                )}
              </div>
              <h2 className="font-heading line-clamp-2 text-sm font-semibold sm:text-lg">
                {item.title}
              </h2>
              <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground sm:mt-1 sm:text-sm">
                {item.subtitle}
              </p>
              <p className="mt-2 text-[10px] font-semibold tracking-wide text-primary uppercase sm:mt-4 sm:text-xs">
                {count === 0
                  ? "No materials yet"
                  : `${count} material${count === 1 ? "" : "s"}`}
              </p>
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}
