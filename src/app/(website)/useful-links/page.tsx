import type { Metadata } from "next";
import { PageShell } from "@/components/website/page-shell";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Useful Links" };

export default async function UsefulLinksPage() {
  let links: Array<{
    id: string;
    title: string;
    url: string;
    description: string | null;
  }> = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("useful_links")
      .select("id, title, url, description")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    links = data || [];
  } catch {
    links = [];
  }

  return (
    <PageShell
      eyebrow="Learn"
      title="Useful Links"
      description="Curated references and external resources from BRASS Foundation."
      wide
    >
      {links.length ? (
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
      ) : (
        <p className="glass-card rounded-2xl p-6 text-muted-foreground">
          No useful links published yet. Check back soon.
        </p>
      )}
    </PageShell>
  );
}
