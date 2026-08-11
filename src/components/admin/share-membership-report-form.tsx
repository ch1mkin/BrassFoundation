"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  shareMembershipReportAction,
  type ShareReportState,
} from "@/lib/cms/share-membership-report-action";

function SendButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-11 rounded-xl bg-primary text-white"
    >
      {pending ? "Sending…" : "Email PDF report now"}
    </Button>
  );
}

export function ShareMembershipReportForm() {
  const [state, action] = useActionState(
    shareMembershipReportAction,
    {} as ShareReportState,
  );

  return (
    <form action={action} className="glass-card space-y-4 rounded-2xl p-6">
      <div>
        <h2 className="font-heading text-xl font-semibold">
          Share membership report now
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Generate a PDF list of registered members (name, age, and related
          fields) for a date range and email it immediately.
        </p>
      </div>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-success">{state.success}</p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-2 sm:col-span-3">
          <span className="text-sm font-medium">Recipient email</span>
          <Input
            name="email"
            type="email"
            required
            placeholder="someone@gmail.com"
            className="h-11 rounded-xl bg-white"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">From (optional)</span>
          <Input name="from" type="date" className="h-11 rounded-xl bg-white" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">To (optional)</span>
          <Input name="to" type="date" className="h-11 rounded-xl bg-white" />
        </label>
      </div>
      <SendButton />
    </form>
  );
}
