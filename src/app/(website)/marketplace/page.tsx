import type { Metadata } from "next";
import { MaterialIcon } from "@/components/ui/material-icon";
import { PageShell } from "@/components/website/page-shell";
import { getPublishedMarketplace } from "@/lib/content/queries";

export const metadata: Metadata = { title: "Marketplace" };

export default async function MarketplacePage() {
  const books = await getPublishedMarketplace();

  return (
    <PageShell
      eyebrow="Marketplace"
      title="Featured Books"
      description="Community publishing — books, poetry, articles, and research curated for education and empowerment."
      wide
    >
      <div className="grid gap-6 md:grid-cols-3">
        {books.map((book) => {
          const rating = Math.round(Number(book.rating || 5));
          return (
            <div
              key={book.id}
              className="rounded-2xl border border-border/30 bg-white p-6 transition-shadow hover:shadow-2xl"
            >
              <div className="mb-4 flex h-64 items-center justify-center rounded-xl bg-surface-low">
                <MaterialIcon name="menu_book" className="text-6xl text-primary/40" />
              </div>
              <h2 className="font-heading text-lg font-semibold">
                {book.title}
              </h2>
              {book.author ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {book.author}
                </p>
              ) : null}
              <div className="mt-2 flex items-center gap-1 text-tertiary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <MaterialIcon
                    key={i}
                    name="star"
                    className={`text-base ${i < rating ? "fill-current" : "opacity-30"}`}
                  />
                ))}
                <span className="ml-1 text-xs text-muted-foreground">
                  ({book.review_count} Reviews)
                </span>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="font-heading text-2xl font-semibold text-primary">
                  {book.price_label}
                </span>
                {book.buy_url ? (
                  <a
                    href={book.buy_url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white"
                  >
                    Buy Now
                  </a>
                ) : (
                  <span className="rounded-lg bg-surface-highest px-5 py-2 text-sm font-bold text-muted-foreground">
                    Soon
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
