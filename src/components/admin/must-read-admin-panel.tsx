"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { AdminLockedForm } from "@/components/admin/admin-locked-form";
import { FileOrUrlField } from "@/components/admin/file-or-url-field";
import {
  deleteMustReadBookAction,
  upsertMustReadBookAction,
  type MustReadBook,
} from "@/lib/content/must-read-actions";

export function MustReadAdminPanel({ books }: { books: MustReadBook[] }) {
  const [editId, setEditId] = useState<string | null>(null);
  const [formNonce, setFormNonce] = useState(0);

  const editing = useMemo(
    () => (editId ? books.find((b) => b.id === editId) || null : null),
    [editId, books],
  );

  useEffect(() => {
    if (editId && !books.some((b) => b.id === editId)) {
      setEditId(null);
    }
  }, [editId, books]);

  const clearEdit = useCallback(() => {
    setEditId(null);
    setFormNonce((n) => n + 1);
  }, []);

  const startEdit = useCallback((id: string) => {
    setEditId(id);
    setFormNonce((n) => n + 1);
    requestAnimationFrame(() => {
      document.getElementById("must-read-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, []);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div id="must-read-form" className="glass-card space-y-4 rounded-2xl p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-semibold">
            {editing ? "Edit must-read book" : "Add must-read book"}
          </h2>
          {editing ? (
            <button
              type="button"
              onClick={clearEdit}
              className="text-xs font-semibold text-muted-foreground hover:text-primary"
            >
              Cancel · New book
            </button>
          ) : null}
        </div>
        {editing ? (
          <p className="text-sm text-primary">Editing: {editing.title}</p>
        ) : null}

        <AdminLockedForm
          key={`${editing?.id || "new"}-${formNonce}`}
          action={upsertMustReadBookAction}
          submitLabel={editing ? "Save changes" : "Add book"}
          className="space-y-3"
          onSuccess={clearEdit}
        >
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <input
            name="title"
            required
            placeholder="Book title"
            defaultValue={editing?.title || ""}
            className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm"
          />
          <input
            name="author"
            placeholder="Author"
            defaultValue={editing?.author || ""}
            className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm"
          />
          <textarea
            name="summary"
            placeholder="Short note (optional)"
            rows={3}
            defaultValue={editing?.summary || ""}
            className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm"
          />
          <input
            name="sort_order"
            type="number"
            defaultValue={
              editing ? editing.sort_order : (books.length || 0) + 1
            }
            placeholder="Sort order"
            className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm"
          />
          <FileOrUrlField
            key={`cover-${editing?.id || "new"}-${formNonce}`}
            name="cover_image_url"
            label="Cover image (optional)"
            bucket="marketplace"
            accept="image/*"
            folder="must-read/covers"
            defaultUrl={editing?.cover_image_url || undefined}
          />
          <FileOrUrlField
            key={`pdf-${editing?.id || "new"}-${formNonce}`}
            name="pdf_url"
            label="PDF upload or link"
            bucket="marketplace"
            accept="application/pdf"
            folder="must-read/pdfs"
            defaultUrl={editing?.pdf_url || undefined}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_published"
              defaultChecked={editing ? editing.is_published : true}
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
          <div
            key={book.id}
            className={`glass-card rounded-2xl p-4 ${
              editing?.id === book.id ? "ring-2 ring-primary/40" : ""
            }`}
          >
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
              <div className="flex shrink-0 flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(book.id)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Edit
                </button>
                <AdminDeleteButton
                  id={book.id}
                  action={deleteMustReadBookAction}
                  label="Remove"
                  pendingLabel="Removing…"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
