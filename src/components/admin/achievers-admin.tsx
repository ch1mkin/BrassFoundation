"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { Input } from "@/components/ui/input";
import { ButtonSpinner } from "@/components/ui/inline-loader";
import { FileOrUrlField } from "@/components/admin/file-or-url-field";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import {
  deleteAchieverAction,
  upsertAchieverAction,
} from "@/lib/content/showcase-actions";
import type { ContentActionState } from "@/lib/content/utils";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";

type Row = {
  id: string;
  full_name: string;
  age: number | null;
  photo_url: string | null;
  achievement: string | null;
  sort_order: number | null;
  is_published: boolean | null;
};

export function AchieversAdmin({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [state, action, pending] = useSafeFormAction(
    upsertAchieverAction,
    {} as ContentActionState,
  );

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form action={action} className="glass-card space-y-4 rounded-2xl p-6">
        <FormLock pending={pending} className="space-y-4">
          <h2 className="font-heading text-lg font-semibold">Add achiever</h2>
          <Input name="full_name" required placeholder="Full name" className="h-11 rounded-xl" />
          <Input name="age" type="number" min={1} placeholder="Age" className="h-11 rounded-xl" />
          <textarea
            name="achievement"
            rows={3}
            placeholder="Achievement / note"
            className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm"
          />
          <FileOrUrlField
            name="photo_url"
            label="Photo"
            bucket="avatars"
            accept="image/*"
            folder="achievers"
          />
          <Input name="sort_order" type="number" defaultValue={0} className="h-11 rounded-xl" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_published" defaultChecked />
            Published
          </label>
          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
          <Button type="submit" disabled={pending} className="rounded-xl bg-primary">
            {pending ? <><ButtonSpinner /> Saving…</> : "Save achiever"}
          </Button>
        </FormLock>
      </form>

      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="glass-card flex gap-3 rounded-2xl p-4">
            {row.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.photo_url} alt="" className="size-16 rounded-full object-cover" />
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
            </div>
            <AdminDeleteButton id={row.id} action={deleteAchieverAction} />
          </div>
        ))}
      </div>
    </div>
  );
}
