"use client";

import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { AdminLockedForm } from "@/components/admin/admin-locked-form";
import { FileOrUrlField } from "@/components/admin/file-or-url-field";
import {
  deleteMustReadBookAction,
  upsertMustReadBookAction,
  type MustReadBook,
} from "@/lib/content/must-read-actions";

export function MustReadAdminPanel({ books }: { books: MustReadBook[] }) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="glass-card space-y-4 rounded-2xl p-6">
        <h2 className="font-heading text-lg font-semibold">Add must-read book</h2>
        <AdminLockedForm
          action={upsertMustReadBookAction}
          submitLabel="Add book"
          className="space-y-3"
        >
          <input
            name="title"
            required
            placeholder="Book title"
            className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm"
          />
          <input
            name="author"
            placeholder="Author"
            className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm"
          />
          <textarea
            name="summary"
            placeholder="Short note (optional)"
            rows={3}
            className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm"
          />
          <input
            name="sort_order"
            type="number"
            defaultValue={(books.length || 0) + 1}
            placeholder="Sort order"
            className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm"
          />
          <FileOrUrlField
            name="cover_image_url"
            label="Cover image (optional)"
            bucket="marketplace"
            accept="image/*"
            folder="must-read/covers"
          />
          <FileOrUrlField
            name="pdf_url"
            label="PDF upload or link"
            bucket="marketplace"
            accept="application/pdf"
            folder="must-read/pdfs"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_published"
              defaultChecked
              className="size-4"
            />
            Published (show on website)
          </label>
        </AdminLockedForm>
      </div>

      <div className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Must-read list</h2>
        {!books.length ? (
          <p className="text-sm text-muted-foreground">
            No books yet. Add a title and PDF to appear in the Must Read section.
          </p>
        ) : null}
        {books.map((book) => (
          <div key={book.id} className="glass-card rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{book.title}</p>
                <p className="text-xs text-muted-foreground">
                  {book.author || "Unknown author"}
                  {book.is_published ? " · Live" : " · Draft"}
                </p>
                <a
                  href={book.pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-xs font-semibold text-primary hover:underline"
                >
                  Open PDF
                </a>
              </div>
              <AdminDeleteButton
                id={book.id}
                action={deleteMustReadBookAction}
                label="Remove"
                pendingLabel="Removing…"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
