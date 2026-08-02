import type { Metadata } from "next";
import Link from "next/link";
import { MustReadBookCard } from "@/components/website/must-read-book-card";
import { getPublishedMustReadBooks } from "@/lib/content/must-read-actions";

export const metadata: Metadata = {
  title: "Must Read",
  description: "Books you must read — curated by Brass Foundation.",
};

export default async function MustReadPage() {
  const books = await getPublishedMustReadBooks();

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-20 lg:py-16">
      <div className="mb-10 max-w-2xl">
        <p className="mb-2 text-sm font-semibold tracking-wide text-primary uppercase">
          Library
        </p>
        <h1 className="font-heading text-3xl font-semibold sm:text-4xl">
          Books You Must Read
        </h1>
        <p className="mt-3 text-muted-foreground">
          Essential reads shared by Brass Foundation. Tap the ? icon for a
          description, or Read PDF to open the book.
        </p>
      </div>

      {!books.length ? (
        <p className="text-sm text-muted-foreground">
          Books will appear here once published by the admin team.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <MustReadBookCard key={book.id} book={book} variant="grid" />
          ))}
        </div>
      )}

      <p className="mt-10 text-sm text-muted-foreground">
        Looking for more titles?{" "}
        <Link href="/marketplace" className="font-semibold text-primary">
          Visit the marketplace
        </Link>
        .
      </p>
    </div>
  );
}
