import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/website/page-shell";
import { getPublishedNews } from "@/lib/content/queries";

export const metadata: Metadata = { title: "News" };

export default async function NewsPage() {
  const posts = await getPublishedNews();

  return (
    <PageShell
      eyebrow="News"
      title="Announcements & Articles"
      description="Stay informed about Brass Foundation programs, press, and community stories."
      wide
    >
      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((item) => (
          <article key={item.id} className="glass-card rounded-2xl p-6">
            <p className="text-xs font-semibold tracking-wide text-primary uppercase">
              {item.is_pinned ? "Pinned · " : ""}
              {item.category}
            </p>
            <h2 className="font-heading mt-2 text-xl font-semibold">
              <Link href={`/news/${item.slug}`} className="hover:text-primary">
                {item.title}
              </Link>
            </h2>
            {item.excerpt ? (
              <p className="mt-3 text-muted-foreground">{item.excerpt}</p>
            ) : null}
            <p className="mt-4 text-xs text-muted-foreground">
              {new Date(item.published_at).toLocaleDateString("en-IN", {
                dateStyle: "medium",
              })}
            </p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
