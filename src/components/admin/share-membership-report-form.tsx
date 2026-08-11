"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { ButtonSpinner } from "@/components/ui/inline-loader";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import {
  shareMembershipReportAction,
  type ShareReportState,
} from "@/lib/cms/share-membership-report-action";

export function ShareMembershipReportForm() {
  const [state, action, pending] = useSafeFormAction(
    shareMembershipReportAction,
    {} as ShareReportState,
    { timeoutMs: 120_000 },
  );
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    if (!state.success) return;
    setBanner(state.success);
    const t = window.setTimeout(() => setBanner(null), 6000);
    return () => window.clearTimeout(t);
  }, [state.success]);

  return (
    <form action={action} className="glass-card space-y-4 rounded-2xl p-6">
      <FormLock pending={pending} className="space-y-4" label="Sending report…">
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
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}
        {banner ? (
          <p
            className="rounded-xl bg-success/10 px-3 py-2 text-sm font-medium text-success"
            role="status"
          >
            {banner}
          </p>
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
            <Input
              name="from"
              type="date"
              className="h-11 rounded-xl bg-white"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">To (optional)</span>
            <Input name="to" type="date" className="h-11 rounded-xl bg-white" />
          </label>
        </div>
        <Button
          type="submit"
          disabled={pending}
          className="h-11 rounded-xl bg-primary text-white"
        >
          {pending ? (
            <span className="inline-flex items-center gap-2">
              <ButtonSpinner />
              Sending…
            </span>
          ) : (
            "Email PDF report now"
          )}
        </Button>
      </FormLock>
    </form>
  );
}
