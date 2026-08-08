"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { InlineLoader } from "@/components/ui/inline-loader";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import { updatePasswordAction, type AuthActionState } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/client";

const initial: AuthActionState = {};

export function UpdatePasswordForm({
  tokenHash,
  type = "recovery",
}: {
  tokenHash?: string | null;
  type?: string | null;
}) {
  const router = useRouter();
  const [state, action, pending] = useSafeFormAction(
    updatePasswordAction,
    initial,
  );
  const [ready, setReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function establishRecoverySession() {
      const supabase = createClient();

      const {
        data: { user: existing },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (existing) {
        setReady(true);
        if (tokenHash) router.replace("/login?mode=reset");
        return;
      }

      if (!tokenHash) {
        setSessionError(
          "Open the reset link from your email, or request a new password reset.",
        );
        return;
      }

      const otpType =
        type === "magiclink" || type === "email" ? type : "recovery";
      const { error } = await supabase.auth.verifyOtp({
        type: otpType as "recovery",
        token_hash: tokenHash,
      });
      if (cancelled) return;
      if (error) {
        setSessionError(
          "This reset link is invalid or has expired. Please request a new one.",
        );
        return;
      }

      setReady(true);
      // Remove secrets from the URL after the session is established.
      router.replace("/login?mode=reset");
    }

    void establishRecoverySession();
    return () => {
      cancelled = true;
    };
  }, [tokenHash, type, router]);

  if (sessionError) {
    return (
      <div className="w-full text-center">
        <h2 className="font-heading mb-2 text-3xl font-semibold">
          Link expired
        </h2>
        <p className="text-muted-foreground" role="alert">
          {sessionError}
        </p>
        <p className="mt-8">
          <Link
            href="/login?mode=forgot"
            className="font-bold text-primary hover:underline"
          >
            Request a new reset link
          </Link>
        </p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-[220px] items-center justify-center">
        <InlineLoader label="Verifying reset link…" />
      </div>
    );
  }

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
            disabled={pending || Boolean(state.success)}
            className="h-12 w-full rounded-xl bg-primary"
          >
            {pending ? "Updating…" : "Update password"}
          </Button>
        </FormLock>
      </form>
    </div>
  );
}
