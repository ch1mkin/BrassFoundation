import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MaterialIcon } from "@/components/ui/material-icon";
import { BookBuyButton } from "@/components/marketplace/book-buy-button";
import { InstantImg } from "@/components/website/instant-img";
import { PageShell } from "@/components/website/page-shell";
import { getUserContext } from "@/lib/auth/session";
import { getUserBookPurchaseMap } from "@/lib/content/book-purchases";
import { getMarketplaceBySlug } from "@/lib/content/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const book = await getMarketplaceBySlug(slug);
  return { title: book?.title || "Featured Book" };
}

export default async function MarketplaceBookPage({ params }: Props) {
  const { slug } = await params;
  const book = await getMarketplaceBySlug(slug);
  if (!book) notFound();

  const context = await getUserContext();
  const purchaseMap = context
    ? await getUserBookPurchaseMap(context.userId)
    : {};
  const status = purchaseMap[book.id] || null;

  return (
    <PageShell
      eyebrow="Featured Books"
      title={book.title}
      description={book.author || undefined}
      wide
    >
      <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
        <div className="overflow-hidden rounded-2xl bg-surface-low">
          {book.cover_image_url ? (
            <InstantImg
              src={book.cover_image_url}
              alt=""
              className="aspect-[3/4] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[3/4] items-center justify-center">
              <MaterialIcon name="menu_book" className="text-6xl text-primary/40" />
            </div>
          )}
        </div>
        <div>
          {book.summary ? (
            <p className="text-lg leading-relaxed text-muted-foreground">
              {book.summary}
            </p>
          ) : (
            <p className="text-muted-foreground">
              Paid web reading only. After you pay, the owner confirms access
              (usually within 24 hours). The book is then saved in your member
              library for anytime reading on this site.
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <span className="font-heading text-3xl font-semibold text-primary">
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
          <p className="mt-4 text-sm text-muted-foreground">
            <Link href="/marketplace" className="font-semibold text-primary">
              ← All featured books
            </Link>
            {" · "}
            <Link href="/member/books" className="font-semibold text-primary">
              My Books
            </Link>
          </p>
        </div>
      </div>
    </PageShell>
  );
}
