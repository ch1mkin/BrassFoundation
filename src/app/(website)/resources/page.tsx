import type { Metadata } from "next";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";
import { PageShell } from "@/components/website/page-shell";
import { RESOURCE_CATEGORIES } from "@/lib/constants";
import { getResourceCategoryCounts } from "@/lib/content/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Digital Library" };

const toneClass = {
  primary: "text-primary group-hover:bg-primary group-hover:text-white",
  secondary: "text-secondary group-hover:bg-secondary group-hover:text-white",
  tertiary: "text-tertiary group-hover:bg-tertiary group-hover:text-white",
  brand: "text-brand group-hover:bg-brand group-hover:text-brand-foreground",
} as const;

export default async function ResourcesPage() {
  const counts = await getResourceCategoryCounts();

  return (
    <PageShell
      eyebrow="Resources"
      title="Digital Library & Resources"
      description="Browse Constitution texts, Ambedkar’s writings, rights kits, and leadership podcasts."
      wide
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {RESOURCE_CATEGORIES.map((item) => {
          const count = counts[item.slug] ?? 0;
          return (
            <Link
              key={item.slug}
              href={`/resources/${item.slug}`}
              className="glass-card group rounded-2xl p-5 transition hover:-translate-y-0.5"
            >
              <div
                className={cn(
                  "mb-4 flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl bg-surface-highest transition-all duration-300",
                  toneClass[item.tone],
                )}
              >
                <MaterialIcon name={item.icon} className="text-5xl" />
              </div>
              <h2 className="font-heading text-lg font-semibold">{item.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{item.subtitle}</p>
              <p className="mt-4 text-xs font-semibold tracking-wide text-primary uppercase">
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
