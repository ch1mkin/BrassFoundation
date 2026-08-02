"use client";

import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { Input } from "@/components/ui/input";
import { ButtonSpinner } from "@/components/ui/inline-loader";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import { registerForEventAction } from "@/lib/content/actions";
import type { ContentActionState } from "@/lib/content/utils";

const initial: ContentActionState = {};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="block text-sm font-medium text-foreground">
        {label}
        {hint ? (
          <span className="ml-1 font-normal text-muted-foreground">
            ({hint})
          </span>
        ) : null}
      </span>
      {children}
    </label>
  );
}

export function EventRegisterForm({
  eventId,
  isLoggedIn,
  defaultName,
  defaultEmail,
}: {
  eventId: string;
  eventSlug: string;
  isLoggedIn: boolean;
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [state, action, pending] = useSafeFormAction(
    registerForEventAction,
    initial,
  );

  if (state.success) {
    return (
      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <p className="text-sm font-medium text-success" role="status">
          {state.success}
        </p>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="glass-card rounded-2xl p-6 sm:p-8"
    >
      <FormLock pending={pending} className="space-y-6" label="Registering…">
        <input type="hidden" name="event_id" value={eventId} />
        <div className="space-y-2">
          <h3 className="font-heading text-xl font-semibold">Register</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {isLoggedIn
              ? `Registering as ${defaultName || defaultEmail}`
              : "Enter your details to register for this event."}
          </p>
        </div>

        <div className="space-y-5">
          <Field label="Full name">
            <Input
              name="full_name"
              required
              placeholder="Your full name"
              defaultValue={defaultName}
              className="h-12 rounded-xl bg-white"
            />
          </Field>
          <Field label="Email">
            <Input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              defaultValue={defaultEmail}
              className="h-12 rounded-xl bg-white"
            />
          </Field>
          <Field label="Phone" hint="optional">
            <Input
              name="phone"
              type="tel"
              placeholder="+91 …"
              className="h-12 rounded-xl bg-white"
            />
          </Field>
          <Field label="Notes" hint="optional">
            <textarea
              name="notes"
              rows={3}
              placeholder="Anything we should know?"
              className="w-full rounded-xl border border-input bg-white px-3 py-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </Field>
        </div>

        {state.error ? (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={pending}
          className="h-12 w-full rounded-xl bg-primary text-base"
        >
          {pending ? (
            <>
              <ButtonSpinner />
              Registering…
            </>
          ) : (
            "Confirm registration"
          )}
        </Button>
      </FormLock>
    </form>
  );
}
