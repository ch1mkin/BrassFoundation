"use client";

import { useEffect } from "react";
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

export function UsefulLinksAdmin({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [state, action, pending] = useSafeFormAction(
    upsertUsefulLinkAction,
    {} as ContentActionState,
  );

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form action={action} className="glass-card space-y-4 rounded-2xl p-6">
        <FormLock pending={pending} className="space-y-4">
          <h2 className="font-heading text-lg font-semibold">Add useful link</h2>
          <Input name="title" required placeholder="Title" className="h-11 rounded-xl" />
          <Input name="url" required type="url" placeholder="https://…" className="h-11 rounded-xl" />
          <textarea
            name="description"
            rows={2}
            placeholder="Short description"
            className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_published" defaultChecked />
            Published
          </label>
          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
          <Button type="submit" disabled={pending} className="rounded-xl bg-primary">
            {pending ? <><ButtonSpinner /> Saving…</> : "Save link"}
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
                  href={row.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  {row.url}
                </a>
              </div>
              <AdminDeleteButton id={row.id} action={deleteUsefulLinkAction} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
