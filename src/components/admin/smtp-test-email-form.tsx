"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { Input } from "@/components/ui/input";
import { ButtonSpinner } from "@/components/ui/inline-loader";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import {
  sendSmtpTestEmailAction,
  type MailActionState,
} from "@/lib/email/actions";

export function SmtpTestEmailForm({
  defaultTo,
  smtpReady,
}: {
  defaultTo?: string;
  smtpReady: boolean;
}) {
  const [state, action, pending] = useSafeFormAction(
    sendSmtpTestEmailAction,
    {} as MailActionState,
  );
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    if (!state.success) return;
    setBanner(state.success);
    const t = window.setTimeout(() => setBanner(null), 4000);
    return () => window.clearTimeout(t);
  }, [state.success]);

  return (
    <form action={action} className="glass-card space-y-4 rounded-2xl p-6">
      <FormLock pending={pending} className="space-y-4" label="Sending test…">
        <div>
          <h2 className="font-heading text-lg font-semibold">
            Send test email
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sends a branded Brass Foundation SMTP test message so you can
            confirm delivery.
          </p>
        </div>
        {!smtpReady ? (
          <p className="text-sm text-destructive">
            SMTP is not configured yet. Add Hostinger credentials in Vercel /
            `.env` first.
          </p>
        ) : null}
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">
            Send test to
          </span>
          <Input
            name="to"
            type="email"
            required
            defaultValue={defaultTo || ""}
            placeholder="you@example.com"
            className="h-11 rounded-xl bg-white"
          />
        </label>
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
        <Button
          type="submit"
          disabled={pending || !smtpReady}
          className="rounded-xl bg-primary"
        >
          {pending ? (
            <>
              <ButtonSpinner />
              Sending…
            </>
          ) : (
            "Send test email"
          )}
        </Button>
      </FormLock>
    </form>
  );
}
