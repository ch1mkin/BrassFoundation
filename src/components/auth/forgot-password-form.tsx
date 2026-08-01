"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { Input } from "@/components/ui/input";
import { requestPasswordResetAction } from "@/lib/auth/actions";
import type { AuthActionState } from "@/lib/auth/actions";

const initial: AuthActionState = {};

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    requestPasswordResetAction,
    initial,
  );

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="font-heading mb-2 text-3xl font-semibold">
          Reset password
        </h2>
        <p className="text-muted-foreground">
          Enter your email and we will send a reset link.
        </p>
      </div>

      <form action={action} className="space-y-5">
        <FormLock pending={pending} className="space-y-5">
        <label className="block space-y-2">
          <span className="ml-1 text-sm font-medium text-muted-foreground">
            Email Address
          </span>
          <Input
            name="email"
            type="email"
            required
            placeholder="name@foundation.org"
            className="h-12 rounded-xl bg-white"
          />
        </label>

        {state.error ? (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-success" role="status">
            {state.success}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="h-12 w-full rounded-xl bg-primary"
        >
          {pending ? "Sending…" : "Send reset link"}
        </Button>
        </FormLock>
      </form>

      <p className="mt-8 text-center text-muted-foreground">
        <Link href="/login" className="font-bold text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
