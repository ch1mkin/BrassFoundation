"use client";

import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { Input } from "@/components/ui/input";
import { ButtonSpinner } from "@/components/ui/inline-loader";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import { registerForEventAction } from "@/lib/content/actions";
import type { ContentActionState } from "@/lib/content/utils";

const initial: ContentActionState = {};

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
      <div className="glass-card rounded-2xl p-6 text-sm text-success">
        {state.success}
      </div>
    );
  }

  return (
    <form action={action} className="glass-card space-y-4 rounded-2xl p-6">
      <FormLock pending={pending} className="space-y-4" label="Registering…">
        <input type="hidden" name="event_id" value={eventId} />
        <h3 className="font-heading text-lg font-semibold">Register</h3>
        <p className="text-xs text-muted-foreground">
          {isLoggedIn
            ? `Registering as ${defaultName || defaultEmail}`
            : "Enter your details to register for this event."}
        </p>
        <Input
          name="full_name"
          required
          placeholder="Full name"
          defaultValue={defaultName}
          className="h-11 rounded-xl bg-white"
        />
        <Input
          name="email"
          type="email"
          required
          placeholder="Email"
          defaultValue={defaultEmail}
          className="h-11 rounded-xl bg-white"
        />
        <Input
          name="phone"
          type="tel"
          placeholder="Phone (optional)"
          className="h-11 rounded-xl bg-white"
        />
        <Input
          name="notes"
          placeholder="Notes (optional)"
          className="h-11 rounded-xl bg-white"
        />
        {state.error ? (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}
        <Button
          type="submit"
          disabled={pending}
          className="h-11 w-full rounded-xl bg-primary"
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
