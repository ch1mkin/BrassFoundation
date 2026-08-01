import type { Metadata } from "next";
import { PageShell } from "@/components/website/page-shell";

export const metadata: Metadata = { title: "News" };

const PLACEHOLDER = [
  {
    title: "Foundation expands scholarship outreach",
    date: "Coming soon",
    blurb:
      "Press releases, media coverage, and community updates will appear here once the news CMS module is connected.",
  },
  {
    title: "District leadership circle announces cohort",
    date: "Coming soon",
    blurb:
      "Announcements and articles will be editable from the admin portal.",
  },
] as const;

export default function NewsPage() {
  return (
    <PageShell
      eyebrow="News"
      title="Announcements & Articles"
      description="Stay informed about Brass Foundation programs, press, and community stories."
      wide
    >
      <div className="grid gap-6 md:grid-cols-2">
        {PLACEHOLDER.map((item) => (
          <article key={item.title} className="glass-card rounded-2xl p-6">
            <p className="text-xs font-semibold tracking-wide text-primary uppercase">
              {item.date}
            </p>
            <h2 className="font-heading mt-2 text-xl font-semibold">
              {item.title}
            </h2>
            <p className="mt-3 text-muted-foreground">{item.blurb}</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
