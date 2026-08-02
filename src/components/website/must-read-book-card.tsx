"use client";

import { useEffect, useId, useState } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";
import { cn } from "@/lib/utils";

export type MustReadBookCardData = {
  id: string;
  title: string;
  author: string | null;
  summary: string | null;
  cover_image_url: string | null;
  pdf_url: string;
};

function BookDescriptionDialog({
  book,
  open,
  onClose,
}: {
  book: MustReadBookCardData;
  open: boolean;
  onClose: () => void;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        aria-label="Close description"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-highest">
            {book.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={book.cover_image_url}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <MaterialIcon
                name="auto_stories"
                className="text-2xl text-primary/40"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 id={titleId} className="font-heading text-lg font-semibold">
              {book.title}
            </h3>
            {book.author ? (
              <p className="mt-0.5 text-sm text-muted-foreground">{book.author}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <MaterialIcon name="close" className="text-[20px]" />
          </button>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {book.summary?.trim() ||
            "No description has been added for this book yet."}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <a
            href={book.pdf_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white"
          >
            <MaterialIcon name="menu_book" className="text-[18px]" />
            Read PDF
          </a>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function MustReadBookCard({
  book,
  className,
  variant = "row",
}: {
  book: MustReadBookCardData;
  className?: string;
  variant?: "row" | "grid";
}) {
  const [open, setOpen] = useState(false);

  if (variant === "grid") {
    return (
      <>
        <div
          className={cn(
            "group glass-card flex flex-col overflow-hidden rounded-2xl",
            className,
          )}
        >
          <div className="relative flex h-48 items-center justify-center bg-surface-highest">
            {book.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={book.cover_image_url}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <MaterialIcon
                name="menu_book"
                className="text-5xl text-primary/40"
              />
            )}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-white/95 text-primary shadow-md ring-1 ring-border transition hover:bg-white"
              aria-label={`About ${book.title}`}
              title="About this book"
            >
              <MaterialIcon name="help" className="text-[20px]" />
            </button>
          </div>
          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-start gap-2">
              <h2 className="font-heading min-w-0 flex-1 text-lg font-semibold">
                {book.title}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-primary/20 text-primary hover:bg-primary/10"
                aria-label={`About ${book.title}`}
              >
                <MaterialIcon name="help" className="text-[16px]" />
              </button>
            </div>
            {book.author ? (
              <p className="mt-1 text-sm text-muted-foreground">{book.author}</p>
            ) : null}
            <a
              href={book.pdf_url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
            >
              <MaterialIcon name="menu_book" className="text-[18px]" />
              Read PDF
              <MaterialIcon name="open_in_new" className="text-[16px]" />
            </a>
          </div>
        </div>
        <BookDescriptionDialog
          book={book}
          open={open}
          onClose={() => setOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <div
        className={cn(
          "group flex gap-4 rounded-2xl border border-border/40 bg-white p-4 transition hover:shadow-lg sm:p-5",
          className,
        )}
      >
        <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-highest sm:size-24">
          {book.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.cover_image_url}
              alt=""
              className="size-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <MaterialIcon
              name="auto_stories"
              className="text-3xl text-primary/40"
            />
          )}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="absolute right-1.5 bottom-1.5 z-10 flex size-7 items-center justify-center rounded-full bg-white text-primary shadow-md ring-2 ring-white hover:bg-primary hover:text-white"
            aria-label={`About ${book.title}`}
            title="About this book"
          >
            <MaterialIcon name="help" className="text-[16px]" />
          </button>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h3 className="font-heading line-clamp-2 min-w-0 flex-1 text-base font-semibold sm:text-lg">
              {book.title}
            </h3>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-primary/25 text-primary hover:bg-primary/10"
              aria-label={`About ${book.title}`}
              title="About this book"
            >
              <MaterialIcon name="help" className="text-[16px]" />
            </button>
          </div>
          {book.author ? (
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              {book.author}
            </p>
          ) : null}
          <a
            href={book.pdf_url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
          >
            <MaterialIcon name="menu_book" className="text-[18px]" />
            Read PDF
            <MaterialIcon name="open_in_new" className="text-[16px]" />
          </a>
        </div>
      </div>
      <BookDescriptionDialog
        book={book}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
