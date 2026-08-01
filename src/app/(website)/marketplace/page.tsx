import type { Metadata } from "next";
import { PageShell } from "@/components/website/page-shell";
import { FEATURED_BOOKS } from "@/lib/constants";

export const metadata: Metadata = { title: "Marketplace" };

export default function MarketplacePage() {
  return (
    <PageShell
      eyebrow="Marketplace"
      title="Featured Books"
      description="Community publishing — books, poetry, articles, and research curated for education and empowerment."
      wide
    >
      <div className="grid gap-6 md:grid-cols-3">
        {FEATURED_BOOKS.map((book) => (
          <div
            key={book.title}
            className="rounded-2xl border border-border/30 bg-white p-6 transition-shadow hover:shadow-2xl"
          >
            <div className="mb-4 flex h-64 items-center justify-center rounded-xl bg-surface-low">
              <span className="material-symbols-outlined text-6xl text-primary/40">
                menu_book
              </span>
            </div>
            <h2 className="font-heading text-lg font-semibold">{book.title}</h2>
            <div className="mt-2 flex items-center gap-1 text-tertiary">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className="material-symbols-outlined text-base"
                  style={{
                    fontVariationSettings: `'FILL' ${i < book.rating ? 1 : 0}`,
                  }}
                >
                  star
                </span>
              ))}
              <span className="ml-1 text-xs text-muted-foreground">
                ({book.reviews} Reviews)
              </span>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="font-heading text-2xl font-semibold text-primary">
                {book.price}
              </span>
              <button
                type="button"
                className="rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white"
              >
                Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
