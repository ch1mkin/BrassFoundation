"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormLock } from "@/components/ui/form-lock";
import { ButtonSpinner } from "@/components/ui/inline-loader";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import type { ContentActionState } from "@/lib/content/utils";

/**
 * Wraps any admin create/update form with pending lock + refresh on success.
 */
export function AdminLockedForm({
  action,
  children,
  className,
  submitLabel = "Save",
  pendingLabel = "Saving…",
  onSuccess,
}: {
  action: (
    prev: ContentActionState,
    formData: FormData,
  ) => Promise<ContentActionState>;
  children: React.ReactNode;
  className?: string;
  submitLabel?: string;
  pendingLabel?: string;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useSafeFormAction(action, {});

  useEffect(() => {
    if (!state.success) return;
    router.refresh();
    onSuccess?.();
  }, [state.success, router, onSuccess]);

  return (
    <form action={formAction} className={className}>
      <FormLock pending={pending} label={pendingLabel} className="space-y-3">
        {children}
        {state.error ? (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-success" role="status">
            {state.success}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white disabled:opacity-70"
        >
          {pending ? (
            <>
              <ButtonSpinner />
              {pendingLabel}
            </>
          ) : (
            submitLabel
          )}
        </button>
      </FormLock>
    </form>
  );
}
