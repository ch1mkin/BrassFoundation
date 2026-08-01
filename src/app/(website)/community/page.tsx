import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/website/page-shell";
import { COMMUNITY_WORK } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Community" };

const badgeClass = {
  error: "bg-destructive text-white",
  primary: "bg-primary text-white",
  secondary: "bg-secondary text-white",
} as const;

export default function CommunityPage() {
  return (
    <PageShell
      eyebrow="Community Work"
      title="Projects & Impact"
      description="Holistic development — from health awareness to educational empowerment across districts."
      wide
    >
      <div className="grid gap-8 md:grid-cols-3">
        {COMMUNITY_WORK.map((item) => (
          <article key={item.slug} className="group">
            <div className="relative mb-4 flex h-48 items-end overflow-hidden rounded-2xl bg-surface-high p-4">
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  badgeClass[item.badgeTone],
                )}
              >
                {item.badge}
              </span>
            </div>
            <h2 className="font-heading text-xl font-semibold">{item.title}</h2>
            <p className="mt-2 text-muted-foreground">{item.description}</p>
            <Link
              href={`/community#${item.slug}`}
              className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary"
            >
              Read More
              <span className="material-symbols-outlined text-[18px]">
                arrow_right_alt
              </span>
            </Link>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
