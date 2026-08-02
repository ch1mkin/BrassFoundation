"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormLock } from "@/components/ui/form-lock";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import type { ContentActionState } from "@/lib/content/utils";

const initial: ContentActionState = {};

type DeleteAction = (
  prev: ContentActionState,
  formData: FormData,
) => Promise<ContentActionState>;

export function AdminDeleteButton({
  id,
  action,
  label = "Delete",
  pendingLabel = "Deleting…",
}: {
  id: string;
  action: DeleteAction;
  label?: string;
  pendingLabel?: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useSafeFormAction(action, initial);

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  return (
    <form action={formAction} className="relative text-right">
      <FormLock pending={pending} label={pendingLabel} className="inline-block">
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          disabled={pending}
          className="text-xs font-semibold text-destructive disabled:opacity-60"
        >
          {pending ? pendingLabel : label}
        </button>
      </FormLock>
      {state.error ? (
        <p className="mt-1 max-w-[10rem] text-[11px] text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
