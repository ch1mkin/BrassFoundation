"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { Input } from "@/components/ui/input";
import { ButtonSpinner } from "@/components/ui/inline-loader";
import { FileOrUrlField } from "@/components/admin/file-or-url-field";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import {
  deleteAchieverAction,
  upsertAchieverAction,
} from "@/lib/content/showcase-actions";
import type { ContentActionState } from "@/lib/content/utils";
import { cdnMediaUrl } from "@/lib/media/cdn";

type Row = {
  id: string;
  full_name: string;
  age: number | null;
  photo_url: string | null;
  achievement: string | null;
  sort_order: number | null;
  is_published: boolean | null;
};

function AchieverForm({
  editing,
  onDone,
}: {
  editing: Row | null;
  onDone: () => void;
}) {
  const router = useRouter();
  const [state, action, pending] = useSafeFormAction(
    upsertAchieverAction,
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
            {editing ? "Edit achiever" : "Add achiever"}
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
          name="full_name"
          required
          placeholder="Full name"
          defaultValue={editing?.full_name || ""}
          className="h-11 rounded-xl"
        />
        <Input
          name="age"
          type="number"
          min={1}
          placeholder="Age"
          defaultValue={editing?.age ?? ""}
          className="h-11 rounded-xl"
        />
        <textarea
          name="achievement"
          rows={3}
          placeholder="Achievement / note"
          defaultValue={editing?.achievement || ""}
          className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm"
        />
        <FileOrUrlField
          name="photo_url"
          label="Photo"
          bucket="avatars"
          accept="image/*"
          folder="achievers"
          defaultUrl={editing?.photo_url || undefined}
        />
        <Input
          name="sort_order"
          type="number"
          defaultValue={editing?.sort_order ?? 0}
          className="h-11 rounded-xl"
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
            "Save achiever"
          )}
        </Button>
      </FormLock>
    </form>
  );
}

export function AchieversAdmin({ rows }: { rows: Row[] }) {
  const [editId, setEditId] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const editing = rows.find((r) => r.id === editId) || null;

  function resetForm() {
    setEditId(null);
    setFormKey((k) => k + 1);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <AchieverForm
        key={`${editId || "new"}-${formKey}`}
        editing={editing}
        onDone={resetForm}
      />

      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="glass-card flex gap-3 rounded-2xl p-4">
            {row.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cdnMediaUrl(row.photo_url)}
                alt=""
                className="size-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                👑
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-medium">{row.full_name}</p>
              <p className="text-xs text-muted-foreground">
                {row.age != null ? `Age ${row.age}` : "Age —"}
                {row.is_published ? "" : " · Draft"}
              </p>
              {row.achievement ? (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {row.achievement}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setEditId(row.id);
                  setFormKey((k) => k + 1);
                }}
                className="mt-2 text-xs font-semibold text-primary hover:underline"
              >
                Edit
              </button>
            </div>
            <AdminDeleteButton id={row.id} action={deleteAchieverAction} />
          </div>
        ))}
      </div>
    </div>
  );
}
