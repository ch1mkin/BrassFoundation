"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { ButtonSpinner } from "@/components/ui/inline-loader";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import {
  saveDailyReportEmailAction,
  type DailyReportEmailState,
} from "@/lib/cms/daily-report-settings-action";

export function DailyReportEmailForm({
  defaultEmail,
}: {
  defaultEmail?: string | null;
}) {
  const router = useRouter();
  const [state, action, pending] = useSafeFormAction(
    saveDailyReportEmailAction,
    {} as DailyReportEmailState,
  );
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    if (!state.success) return;
    setBanner(state.success);
    router.refresh();
    const t = window.setTimeout(() => setBanner(null), 5000);
    return () => window.clearTimeout(t);
  }, [state.success, router]);

  return (
    <form action={action} className="glass-card space-y-4 rounded-2xl p-6">
      <FormLock pending={pending} className="space-y-4" label="Saving…">
        <div>
          <h2 className="font-heading text-xl font-semibold">
            Daily membership PDF report
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter one or more email addresses (comma-separated) that should
            receive a PDF of registrations every day at 12:00 AM IST. Requires{" "}
            <code className="text-xs">CRON_SECRET</code>, SMTP, and Vercel Cron.
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
        <label className="block space-y-2">
          <span className="text-sm font-medium">Recipient email(s)</span>
          <Input
            name="email"
            type="text"
            required
            defaultValue={defaultEmail || ""}
            placeholder="one@gmail.com, two@gmail.com"
            className="h-11 rounded-xl bg-white"
          />
          <span className="text-xs text-muted-foreground">
            Separate multiple addresses with commas.
          </span>
        </label>
        <Button
          type="submit"
          disabled={pending}
          className="h-11 rounded-xl bg-primary text-white"
        >
          {pending ? (
            <span className="inline-flex items-center gap-2">
              <ButtonSpinner />
              Saving…
            </span>
          ) : (
            "Save report email"
          )}
        </Button>
      </FormLock>
    </form>
  );
}
