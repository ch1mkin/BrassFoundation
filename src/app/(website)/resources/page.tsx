import type { Metadata } from "next";
import { PageShell } from "@/components/website/page-shell";
import { getPublishedResources } from "@/lib/content/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Resources" };

const toneClass = {
  primary: "text-primary group-hover:bg-primary group-hover:text-white",
  secondary: "text-secondary group-hover:bg-secondary group-hover:text-white",
  tertiary: "text-tertiary group-hover:bg-tertiary group-hover:text-white",
  brand: "text-brand group-hover:bg-brand group-hover:text-brand-foreground",
} as const;

export default async function ResourcesPage() {
  const resources = await getPublishedResources();

  return (
    <PageShell
      eyebrow="Resources"
      title="Digital Library & Resources"
      description="Constitution, study material, books, PDFs, training content, and audio."
      wide
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {resources.map((item) => {
          const href = item.file_url || item.external_url;
          const tone =
            item.tone in toneClass
              ? (item.tone as keyof typeof toneClass)
              : "primary";
          return (
            <div key={item.id} className="glass-card group rounded-2xl p-5">
              <div
                className={cn(
                  "mb-4 flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl bg-surface-highest transition-all duration-300",
                  !item.thumbnail_url && toneClass[tone],
                )}
              >
                {item.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.thumbnail_url}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-5xl">
                    {item.icon}
                  </span>
                )}
              </div>
              <h2 className="font-heading text-lg font-semibold">{item.title}</h2>
              {item.subtitle ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.subtitle}
                </p>
              ) : null}
              <div className="mt-4 flex items-center justify-between">
                {item.file_size_label ? (
                  <span className="rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                    {item.file_size_label}
                  </span>
                ) : (
                  <span />
                )}
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="material-symbols-outlined text-primary"
                    aria-label={`Open ${item.title}`}
                  >
                    download
                  </a>
                ) : (
                  <span className="material-symbols-outlined text-muted-foreground">
                    lock
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
