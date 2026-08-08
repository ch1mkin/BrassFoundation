"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { PasswordInput } from "@/components/auth/password-input";
import { MembershipLink } from "@/components/membership/membership-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import {
  signInAction,
  type AuthActionState,
} from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

function safeNext(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/member";
  }
  return next;
}

const initial: AuthActionState = {};

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const urlError = searchParams.get("error");
  const [state, formAction, pending] = useSafeFormAction(signInAction, initial);
  const navigated = useRef(false);

  useEffect(() => {
    if (!state.redirectTo || navigated.current) return;
    navigated.current = true;
    window.location.assign(state.redirectTo);
  }, [state.redirectTo]);

  const error = state.error || urlError;
  const busy = pending || Boolean(state.redirectTo);

  return (
    <div className="w-full">
      <div className="mb-10 text-center">
        <h2 className="font-heading mb-2 text-3xl font-semibold text-foreground">
          Welcome Back
        </h2>
        <p className="text-muted-foreground">
          Sign in to your Brass Foundation member account
        </p>
      </div>

      <form action={formAction} className="space-y-5" noValidate>
        <input type="hidden" name="next" value={next} />
        <fieldset
          disabled={busy}
          aria-busy={busy}
          className={cn(
            "min-w-0 space-y-5 border-0 p-0",
            busy && "opacity-70",
          )}
        >
          <label className="block space-y-2">
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              Email Address
            </span>
            <div className="relative">
              <MaterialIcon
                name="mail"
                className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                name="email"
                type="email"
                required
                placeholder="name@brassfoundation.com"
                autoComplete="email"
                className="h-12 rounded-xl border-border bg-white pr-4 pl-12"
              />
            </div>
          </label>

          <label className="block space-y-2">
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              Password
            </span>
            <div className="relative">
              <MaterialIcon
                name="lock"
                className="absolute top-1/2 left-4 z-10 -translate-y-1/2 text-muted-foreground"
              />
              <PasswordInput
                name="password"
                required
                minLength={8}
                placeholder="••••••••"
                autoComplete="current-password"
                className="pl-12"
              />
            </div>
          </label>

          <div className="flex items-center justify-between pt-1">
            <a
              href="/login?mode=forgot"
              className="text-sm font-medium text-primary hover:underline"
            >
              Forgot Password?
            </a>
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            disabled={busy}
            className={cn(
              "h-12 w-full rounded-xl bg-primary text-sm font-medium shadow-lg shadow-primary/10 hover:bg-primary/90",
            )}
          >
            {busy ? "Please wait…" : "Sign In"}
            <MaterialIcon name="arrow_forward" className="text-[18px]" />
          </Button>
        </fieldset>
      </form>

      <div className="mt-10 text-center">
        <p className="text-muted-foreground">
          New here?{" "}
          <MembershipLink className="font-bold text-primary hover:underline">
            Become a member
          </MembershipLink>
        </p>
      </div>
    </div>
  );
}
