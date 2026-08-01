import type { Metadata } from "next";
import { PageShell } from "@/components/website/page-shell";
import { RESOURCES_PREVIEW } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Resources" };

const toneClass = {
  primary: "text-primary group-hover:bg-primary group-hover:text-white",
  secondary: "text-secondary group-hover:bg-secondary group-hover:text-white",
  tertiary: "text-tertiary group-hover:bg-tertiary group-hover:text-white",
  brand: "text-brand group-hover:bg-brand group-hover:text-brand-foreground",
} as const;

export default function ResourcesPage() {
  return (
    <PageShell
      eyebrow="Resources"
      title="Digital Library & Resources"
      description="Constitution, study material, books, PDFs, training content, and audio — growing into a full download center with secure in-app viewing."
      wide
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {RESOURCES_PREVIEW.map((item) => (
          <div key={item.title} className="glass-card group rounded-2xl p-5">
            <div
              className={cn(
                "mb-4 flex aspect-[3/4] items-center justify-center rounded-xl bg-surface-highest transition-all duration-300",
                toneClass[item.tone],
              )}
            >
              <span className="material-symbols-outlined text-5xl">
                {item.icon}
              </span>
            </div>
            <h2 className="font-heading text-lg font-semibold">{item.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{item.subtitle}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                {item.size}
              </span>
              <span className="material-symbols-outlined text-primary">
                download
              </span>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
