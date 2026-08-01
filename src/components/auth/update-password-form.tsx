"use client";

import Link from "next/link";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import { updatePasswordAction, type AuthActionState } from "@/lib/auth/actions";

const initial: AuthActionState = {};

export function UpdatePasswordForm() {
  const [state, action, pending] = useSafeFormAction(
    updatePasswordAction,
    initial,
  );

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="font-heading mb-2 text-3xl font-semibold">
          Choose a new password
        </h2>
        <p className="text-muted-foreground">
          Enter and confirm your new password to finish resetting.
        </p>
      </div>

      <form action={action} className="space-y-5">
        <FormLock pending={pending} className="space-y-5">
        <label className="block space-y-2">
          <span className="ml-1 text-sm font-medium text-muted-foreground">
            New password
          </span>
          <PasswordInput
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        <label className="block space-y-2">
          <span className="ml-1 text-sm font-medium text-muted-foreground">
            Confirm password
          </span>
          <PasswordInput
            name="confirm_password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>

        {state.error ? (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-success" role="status">
            {state.success}{" "}
            <Link href="/member" className="font-bold text-primary underline">
              Go to dashboard
            </Link>
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="h-12 w-full rounded-xl bg-primary"
        >
          {pending ? "Updating…" : "Update password"}
        </Button>
        </FormLock>
      </form>
    </div>
  );
}
