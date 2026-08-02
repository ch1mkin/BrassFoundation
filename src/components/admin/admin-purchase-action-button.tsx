"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormLock } from "@/components/ui/form-lock";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import type { ContentActionState } from "@/lib/content/utils";

const initial: ContentActionState = {};

type PurchaseAction = (
  prev: ContentActionState,
  formData: FormData,
) => Promise<ContentActionState>;

export function AdminPurchaseActionButton({
  id,
  action,
  label,
  pendingLabel,
  variant = "success",
}: {
  id: string;
  action: PurchaseAction;
  label: string;
  pendingLabel: string;
  variant?: "success" | "danger";
}) {
  const router = useRouter();
  const [state, formAction, pending] = useSafeFormAction(action, initial);

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  return (
    <form action={formAction} className="relative">
      <FormLock pending={pending} label={pendingLabel} className="inline-block">
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          disabled={pending}
          className={
            variant === "success"
              ? "rounded-lg bg-success px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
              : "rounded-lg bg-destructive/10 px-4 py-2 text-sm font-bold text-destructive disabled:opacity-60"
          }
        >
          {pending ? pendingLabel : label}
        </button>
      </FormLock>
      {state.error ? (
        <p className="mt-1 text-[11px] text-destructive">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="mt-1 text-[11px] text-success">{state.success}</p>
      ) : null}
    </form>
  );
}
