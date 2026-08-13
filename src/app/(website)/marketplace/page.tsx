import type { Metadata } from "next";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";
import { BookBuyButton } from "@/components/marketplace/book-buy-button";
import { InstantImg } from "@/components/website/instant-img";
import { PageShell } from "@/components/website/page-shell";
import { getUserContext } from "@/lib/auth/session";
import { getUserBookPurchaseMap } from "@/lib/content/book-purchases";
import { getPublishedMarketplace } from "@/lib/content/queries";

export const metadata: Metadata = { title: "Featured Books" };

export default async function MarketplacePage() {
  const [books, context] = await Promise.all([
    getPublishedMarketplace(),
    getUserContext(),
  ]);
  const purchaseMap = context
    ? await getUserBookPurchaseMap(context.userId)
    : {};

  return (
    <PageShell
      eyebrow="Marketplace"
      title="Featured Books"
      description="Paid titles for web reading only. After payment, the owner confirms access (usually within 24 hours). Purchased books stay in your member library."
      wide
    >
      {books.length === 0 ? (
        <p className="glass-card rounded-2xl p-8 text-center text-muted-foreground">
          No featured books yet. Check back soon, or ask an admin to publish
          titles from the marketplace admin.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {books.map((book) => {
            const rating = Math.round(Number(book.rating || 5));
            const status = purchaseMap[book.id] || null;
            return (
              <div
                key={book.id}
                className="rounded-2xl border border-border/30 bg-white p-6 transition-shadow hover:shadow-2xl"
              >
                <Link href={`/marketplace/${book.slug}`} className="block">
                  <div className="mb-4 flex h-64 items-center justify-center overflow-hidden rounded-xl bg-surface-low">
                    {book.cover_image_url ? (
                      <InstantImg
                        src={book.cover_image_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <MaterialIcon
                        name="menu_book"
                        className="text-6xl text-primary/40"
                      />
                    )}
                  </div>
                  <h2 className="font-heading text-lg font-semibold">
                    {book.title}
                  </h2>
                  {book.author ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {book.author}
                    </p>
                  ) : null}
                </Link>
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
                <div className="mt-6 flex items-center justify-between gap-3">
                  <span className="font-heading text-2xl font-semibold text-primary">
                    {book.price_label}
                  </span>
                  <BookBuyButton
                    bookId={book.id}
                    bookSlug={book.slug}
                    title={book.title}
                    priceLabel={book.price_label}
                    status={status}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
