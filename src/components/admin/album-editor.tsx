"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { Input } from "@/components/ui/input";
import { ButtonSpinner } from "@/components/ui/inline-loader";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import { upsertGalleryAlbumAction } from "@/lib/content/gallery-org-actions";
import type { ContentActionState } from "@/lib/content/utils";

type Album = {
  id: string;
  title: string;
  heading: string | null;
  description?: string | null;
  display_mode: string;
  event_date: string | null;
  is_published: boolean;
  sort_order: number;
};

export function AlbumEditor({ album }: { album: Album | null }) {
  const router = useRouter();
  const [mode, setMode] = useState<"create" | "edit">(
    album ? "edit" : "create",
  );
  const [formKey, setFormKey] = useState(0);
  const [state, action, pending] = useSafeFormAction(
    upsertGalleryAlbumAction,
    {} as ContentActionState,
  );

  const editing = mode === "edit" && album;
  const pendingLabel = editing ? "Saving album…" : "Creating album…";

  useEffect(() => {
    if (!state.success) return;
    router.refresh();
    if (!editing) {
      // Remount create form after a successful create so fields clear,
      // while keeping the success banner via a short-lived key swap.
      const t = window.setTimeout(() => setFormKey((k) => k + 1), 1600);
      return () => window.clearTimeout(t);
    }
  }, [state.success, router, editing]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("create")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${mode === "create" ? "bg-primary text-white" : "bg-surface-low"}`}
        >
          New album
        </button>
        {album ? (
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${mode === "edit" ? "bg-primary text-white" : "bg-surface-low"}`}
          >
            Edit selected
          </button>
        ) : null}
      </div>

      <form
        key={`${mode}-${editing ? album.id : `new-${formKey}`}`}
        action={action}
        className="glass-card space-y-3 rounded-2xl p-5"
      >
        <FormLock pending={pending} label={pendingLabel} className="space-y-3">
          <h2 className="font-heading text-lg font-semibold">
            {editing ? "Edit album" : "New album / event heading"}
          </h2>
          {editing ? <input type="hidden" name="id" value={album.id} /> : null}
          <Input
            name="title"
            required
            placeholder="Album title"
            defaultValue={editing ? album.title : ""}
            className="h-10 rounded-xl"
          />
          <Input
            name="heading"
            placeholder="Public heading"
            defaultValue={editing ? album.heading || "" : ""}
            className="h-10 rounded-xl"
          />
          <textarea
            name="description"
            placeholder="Description"
            rows={3}
            defaultValue={editing ? album.description || "" : ""}
            className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm"
          />
          <select
            name="display_mode"
            defaultValue={editing ? album.display_mode : "both"}
            className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm"
          >
            <option value="grid">Grid</option>
            <option value="slider">Slider</option>
            <option value="both">Both</option>
          </select>
          <Input
            name="event_date"
            placeholder="Event date YYYY-MM-DD"
            defaultValue={editing ? album.event_date || "" : ""}
            className="h-10 rounded-xl"
          />
          <Input
            name="sort_order"
            type="number"
            defaultValue={editing ? album.sort_order : 0}
            className="h-10 rounded-xl"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_published"
              defaultChecked={editing ? album.is_published : true}
            />
            Published
          </label>
          {state.error ? (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {state.error}
            </p>
          ) : null}
          {state.success ? (
            <p
              className="rounded-xl bg-success/10 px-3 py-2 text-sm font-medium text-success"
              role="status"
            >
              {state.success}
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-primary"
          >
            {pending ? (
              <>
                <ButtonSpinner />
                {pendingLabel}
              </>
            ) : editing ? (
              "Save album changes"
            ) : (
              "Create album"
            )}
          </Button>
        </FormLock>
      </form>
    </div>
  );
}
