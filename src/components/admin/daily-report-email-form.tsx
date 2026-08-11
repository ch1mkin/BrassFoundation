"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  saveDailyReportEmailAction,
  type DailyReportEmailState,
} from "@/lib/cms/daily-report-settings-action";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-11 rounded-xl bg-primary text-white"
    >
      {pending ? "Saving…" : "Save report email"}
    </Button>
  );
}

export function DailyReportEmailForm({
  defaultEmail,
}: {
  defaultEmail?: string | null;
}) {
  const [state, action] = useActionState(
    saveDailyReportEmailAction,
    {} as DailyReportEmailState,
  );

  return (
    <form action={action} className="glass-card space-y-4 rounded-2xl p-6">
      <div>
        <h2 className="font-heading text-xl font-semibold">
          Daily membership PDF report
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the Gmail (or inbox) that should receive a PDF of registrations
          every day at 12:00 AM IST (after the previous day ends). Requires{" "}
          <code className="text-xs">CRON_SECRET</code>, SMTP, and Vercel Cron.
        </p>
      </div>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-success">{state.success}</p>
      ) : null}
      <label className="block space-y-2">
        <span className="text-sm font-medium">Recipient email</span>
        <Input
          name="email"
          type="email"
          required
          defaultValue={defaultEmail || ""}
          placeholder="reports@example.com"
          className="h-11 rounded-xl bg-white"
        />
      </label>
      <SaveButton />
    </form>
  );
}
