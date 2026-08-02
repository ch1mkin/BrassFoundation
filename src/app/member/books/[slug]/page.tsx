import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProtectedBookReader } from "@/components/marketplace/protected-book-reader";
import { getUserContext } from "@/lib/auth/session";
import { getApprovedPurchaseForBook } from "@/lib/content/book-purchases";
import { getMarketplaceBySlug } from "@/lib/content/queries";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const book = await getMarketplaceBySlug(slug);
  return { title: book ? `Read · ${book.title}` : "Read book" };
}

export default async function MemberBookReaderPage({ params }: Props) {
  const context = await getUserContext();
  if (!context) redirect("/login?next=/member/books");

  const { slug } = await params;
  const book = await getMarketplaceBySlug(slug);
  if (!book) notFound();

  const purchase = await getApprovedPurchaseForBook(context.userId, book.id);
  if (!purchase) {
    // Check if pending
    const supabase = await createClient();
    const { data: pending } = await supabase
      .from("book_purchases")
      .select("status")
      .eq("user_id", context.userId)
      .eq("marketplace_item_id", book.id)
      .maybeSingle();

    return (
      <div className="mx-auto max-w-lg space-y-4 py-10 text-center">
        <h1 className="font-heading text-2xl font-semibold">{book.title}</h1>
        <p className="text-muted-foreground">
          {pending?.status === "paid_awaiting_approval"
            ? "Payment received. Access unlocks after owner confirmation (usually within 24 hours)."
            : "You need to purchase this book before reading."}
        </p>
        <Link href="/member/books" className="font-semibold text-primary">
          ← My Books
        </Link>
        {" · "}
        <Link
          href={`/marketplace/${book.slug}`}
          className="font-semibold text-primary"
        >
          Book page
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link href="/member/books" className="text-sm font-semibold text-primary">
        ← My Books
      </Link>
      <ProtectedBookReader
        bookId={book.id}
        title={book.title}
        watermark={{
          name: purchase.buyer_name || context.profile?.full_name,
          email: purchase.buyer_email || context.email,
          userId: context.userId.slice(0, 8),
          purchaseId: purchase.id.slice(0, 8),
        }}
      />
    </div>
  );
}
