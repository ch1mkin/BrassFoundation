"use client";

import { FormLock } from "@/components/ui/form-lock";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import { setMemberStatusAction } from "@/lib/content/gallery-org-actions";
import type { ContentActionState } from "@/lib/content/utils";

export function MemberStatusForm({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus?: string | null;
}) {
  const [state, action, pending] = useSafeFormAction(
    setMemberStatusAction,
    {} as ContentActionState,
  );

  return (
    <form action={action} className="mt-2 flex flex-wrap items-center gap-2">
      <FormLock pending={pending} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="application_id" value={applicationId} />
      <select
        name="member_status"
        defaultValue={currentStatus || "active"}
        className="h-8 rounded-lg border border-input bg-white px-2 text-xs"
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="suspended">Suspended</option>
        <option value="left">Left organization</option>
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-secondary px-2 py-1 text-xs font-semibold text-white"
      >
        {pending ? "…" : "Set status"}
      </button>
      {state.success ? (
        <span className="text-xs text-success">{state.success}</span>
      ) : null}
      {state.error ? (
        <span className="text-xs text-destructive">{state.error}</span>
      ) : null}
      </FormLock>
    </form>
  );
}
