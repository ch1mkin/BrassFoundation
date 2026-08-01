"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import {
  approveMembershipAction,
  rejectMembershipAction,
  type MembershipReviewState,
} from "@/lib/membership/review-actions";

const initial: MembershipReviewState = {};

export function MembershipReviewActions({
  applicationId,
  status,
}: {
  applicationId: string;
  status: string;
}) {
  const [approveState, approve, approvePending] = useActionState(
    approveMembershipAction,
    initial,
  );
  const [rejectState, reject, rejectPending] = useActionState(
    rejectMembershipAction,
    initial,
  );

  if (status === "approved" || status === "rejected") {
    return (
      <span className="text-xs tracking-wide text-muted-foreground uppercase">
        {status}
      </span>
    );
  }

  const message = approveState.success || approveState.error || rejectState.success || rejectState.error;
  const busy = approvePending || rejectPending;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <form action={approve}>
          <FormLock pending={busy}>
            <input type="hidden" name="application_id" value={applicationId} />
            <Button
              type="submit"
              size="sm"
              disabled={busy}
              className="rounded-xl"
            >
              {approvePending ? "…" : "Approve"}
            </Button>
          </FormLock>
        </form>
        <form action={reject}>
          <FormLock pending={busy}>
            <input type="hidden" name="application_id" value={applicationId} />
            <Button
              type="submit"
              size="sm"
              variant="outline"
              disabled={busy}
              className="rounded-xl"
            >
              {rejectPending ? "…" : "Reject"}
            </Button>
          </FormLock>
        </form>
      </div>
      {message && (
        <p
          className={
            approveState.error || rejectState.error
              ? "text-xs text-destructive"
              : "text-xs text-success"
          }
        >
          {message}
        </p>
      )}
    </div>
  );
}
