import type { Metadata } from "next";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";
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
          Essential reads shared by Brass Foundation. Open a PDF to start
          reading.
        </p>
      </div>

      {!books.length ? (
        <p className="text-sm text-muted-foreground">
          Books will appear here once published by the admin team.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <a
              key={book.id}
              href={book.pdf_url}
              target="_blank"
              rel="noreferrer"
              className="group glass-card flex flex-col overflow-hidden rounded-2xl transition hover:shadow-lg"
            >
              <div className="flex h-48 items-center justify-center bg-surface-highest">
                {book.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={book.cover_image_url}
                    alt=""
                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <MaterialIcon
                    name="menu_book"
                    className="text-5xl text-primary/40"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="font-heading text-lg font-semibold">
                  {book.title}
                </h2>
                {book.author ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {book.author}
                  </p>
                ) : null}
                {book.summary ? (
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                    {book.summary}
                  </p>
                ) : null}
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">
                  Read PDF
                  <MaterialIcon name="open_in_new" className="text-[16px]" />
                </span>
              </div>
            </a>
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
