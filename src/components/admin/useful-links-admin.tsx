"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { Input } from "@/components/ui/input";
import { ButtonSpinner } from "@/components/ui/inline-loader";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import {
  deleteUsefulLinkAction,
  upsertUsefulLinkAction,
} from "@/lib/content/showcase-actions";
import type { ContentActionState } from "@/lib/content/utils";

type Row = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  is_published: boolean | null;
};

function UsefulLinkForm({
  editing,
  onDone,
}: {
  editing: Row | null;
  onDone: () => void;
}) {
  const router = useRouter();
  const [state, action, pending] = useSafeFormAction(
    upsertUsefulLinkAction,
    {} as ContentActionState,
  );
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    if (!state.success) return;
    setBanner(state.success);
    router.refresh();
    const t = window.setTimeout(() => {
      setBanner(null);
      onDone();
    }, 2200);
    return () => window.clearTimeout(t);
  }, [state.success, router, onDone]);

  return (
    <form action={action} className="glass-card space-y-4 rounded-2xl p-6">
      <FormLock pending={pending} className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-semibold">
            {editing ? "Edit useful link" : "Add useful link"}
          </h2>
          {editing ? (
            <button
              type="button"
              onClick={onDone}
              className="text-xs font-semibold text-muted-foreground hover:text-primary"
            >
              Cancel · New
            </button>
          ) : null}
        </div>
        {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
        <Input
          name="title"
          required
          placeholder="Title"
          defaultValue={editing?.title || ""}
          className="h-11 rounded-xl"
        />
        <Input
          name="url"
          required
          type="url"
          placeholder="https://…"
          defaultValue={editing?.url || ""}
          className="h-11 rounded-xl"
        />
        <textarea
          name="description"
          rows={2}
          placeholder="Short description"
          defaultValue={editing?.description || ""}
          className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={editing ? Boolean(editing.is_published) : true}
          />
          Published
        </label>
        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}
        {banner ? (
          <p className="rounded-xl bg-success/10 px-3 py-2 text-sm font-medium text-success">
            {banner}
          </p>
        ) : null}
        <Button type="submit" disabled={pending} className="rounded-xl bg-primary">
          {pending ? (
            <>
              <ButtonSpinner />
              Saving…
            </>
          ) : editing ? (
            "Save changes"
          ) : (
            "Save link"
          )}
        </Button>
      </FormLock>
    </form>
  );
}

export function UsefulLinksAdmin({ rows }: { rows: Row[] }) {
  const [editId, setEditId] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const editing = rows.find((r) => r.id === editId) || null;

  function resetForm() {
    setEditId(null);
    setFormKey((k) => k + 1);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <UsefulLinkForm
        key={`${editId || "new"}-${formKey}`}
        editing={editing}
        onDone={resetForm}
      />
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="glass-card rounded-2xl p-4">
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-medium">{row.title}</p>
                <a
                  href={row.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  {row.url}
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setEditId(row.id);
                    setFormKey((k) => k + 1);
                  }}
                  className="mt-2 block text-xs font-semibold text-primary hover:underline"
                >
                  Edit
                </button>
              </div>
              <AdminDeleteButton id={row.id} action={deleteUsefulLinkAction} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
