"use client";

import { useEffect, useState } from "react";
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
  confirmMessage,
  successHoldMs = 1400,
}: {
  id: string;
  action: DeleteAction;
  label?: string;
  pendingLabel?: string;
  /** Optional confirm prompt before delete. */
  confirmMessage?: string;
  /** How long to show the success message before refreshing. */
  successHoldMs?: number;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useSafeFormAction(action, initial);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!state.success) return;
    setShowSuccess(true);
    const t = window.setTimeout(() => {
      router.refresh();
    }, successHoldMs);
    return () => window.clearTimeout(t);
  }, [state.success, router, successHoldMs]);

  if (showSuccess && state.success) {
    return (
      <p
        className="rounded-lg bg-success/10 px-2 py-1 text-xs font-semibold text-success"
        role="status"
      >
        {state.success}
      </p>
    );
  }

  return (
    <form
      action={formAction}
      className="relative text-right"
      onSubmit={(e) => {
        if (
          confirmMessage &&
          !window.confirm(confirmMessage)
        ) {
          e.preventDefault();
        }
      }}
    >
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
        <p
          className="mt-1 max-w-[10rem] text-[11px] text-destructive"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
