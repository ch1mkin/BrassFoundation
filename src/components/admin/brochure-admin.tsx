"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { Input } from "@/components/ui/input";
import { ButtonSpinner } from "@/components/ui/inline-loader";
import { FileOrUrlField } from "@/components/admin/file-or-url-field";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import {
  deleteBrochureAction,
  upsertBrochureAction,
} from "@/lib/content/showcase-actions";
import type { ContentActionState } from "@/lib/content/utils";

type Row = {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  cover_image_url: string | null;
  is_published: boolean | null;
};

export function BrochureAdmin({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [state, action, pending] = useSafeFormAction(
    upsertBrochureAction,
    {} as ContentActionState,
  );

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form action={action} className="glass-card space-y-4 rounded-2xl p-6">
        <FormLock pending={pending} className="space-y-4">
          <h2 className="font-heading text-lg font-semibold">Upload brochure</h2>
          <Input name="title" defaultValue="Organisation Brochure" className="h-11 rounded-xl" />
          <textarea
            name="description"
            rows={3}
            placeholder="Short description"
            className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm"
          />
          <FileOrUrlField
            name="file_url"
            label="Brochure PDF"
            bucket="resources"
            accept="application/pdf"
            folder="brochure"
          />
          <FileOrUrlField
            name="cover_image_url"
            label="Cover image (optional)"
            bucket="gallery"
            accept="image/*"
            folder="brochure"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_published" defaultChecked />
            Published
          </label>
          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
          <Button type="submit" disabled={pending} className="rounded-xl bg-primary">
            {pending ? <><ButtonSpinner /> Saving…</> : "Save brochure"}
          </Button>
        </FormLock>
      </form>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="glass-card rounded-2xl p-4">
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-medium">{row.title}</p>
                <a
                  href={row.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Open file
                </a>
              </div>
              <AdminDeleteButton id={row.id} action={deleteBrochureAction} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
