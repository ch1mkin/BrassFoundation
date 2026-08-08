import type { Metadata } from "next";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";
import { PageShell } from "@/components/website/page-shell";
import { getResourceCategoryCounts } from "@/lib/content/queries";
import { getResourceCategories } from "@/lib/content/resource-categories";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Digital Library" };

const toneClass = {
  primary: "text-primary group-hover:bg-primary group-hover:text-white",
  secondary: "text-secondary group-hover:bg-secondary group-hover:text-white",
  tertiary: "text-tertiary group-hover:bg-tertiary group-hover:text-white",
  brand: "text-brand group-hover:bg-brand group-hover:text-brand-foreground",
} as const;

export default async function ResourcesPage() {
  const [categories, counts, links] = await Promise.all([
    getResourceCategories(),
    getResourceCategoryCounts(),
    (async () => {
      try {
        const supabase = await createClient();
        const { data } = await supabase
          .from("useful_links")
          .select("id, title, url, description")
          .eq("is_published", true)
          .order("sort_order", { ascending: true });
        return data || [];
      } catch {
        return [];
      }
    })(),
  ]);

  return (
    <PageShell
      eyebrow="Resources"
      title="Digital Library & Resources"
      description="Browse library categories — Constitution texts, writings, kits, podcasts, and more."
      wide
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
              className="glass-card group rounded-2xl p-5 transition hover:-translate-y-0.5"
            >
              <div
                className={cn(
                  "mb-4 flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl bg-surface-highest transition-all duration-300",
                  toneClass[tone],
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

      {links.length ? (
        <section className="mt-14 space-y-4">
          <h2 className="font-heading text-2xl font-semibold">Useful links</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card rounded-2xl p-5 transition hover:-translate-y-0.5 hover:ring-1 hover:ring-primary/30"
              >
                <p className="font-heading text-lg font-semibold">{link.title}</p>
                {link.description ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {link.description}
                  </p>
                ) : null}
                <p className="mt-3 text-xs font-semibold text-primary">
                  Open link →
                </p>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
