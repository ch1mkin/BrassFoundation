"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { Input } from "@/components/ui/input";
import {
  signInAction,
  signUpAction,
  type AuthActionState,
} from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

const initial: AuthActionState = {};

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/member";
  const mode = searchParams.get("mode") === "signup" ? "signup" : "signin";

  const [signInState, signIn, signInPending] = useActionState(
    signInAction,
    initial,
  );
  const [signUpState, signUp, signUpPending] = useActionState(
    signUpAction,
    initial,
  );

  const state = mode === "signup" ? signUpState : signInState;
  const pending = mode === "signup" ? signUpPending : signInPending;

  return (
    <div className="w-full">
      <div className="mb-10 text-center">
        <h2 className="font-heading mb-2 text-3xl font-semibold text-foreground">
          {mode === "signup" ? "Join the Community" : "Welcome Back"}
        </h2>
        <p className="text-muted-foreground">
          {mode === "signup"
            ? "Create your Brass Foundation account"
            : "Access your learning dashboard"}
        </p>
      </div>

      <form
        action={mode === "signup" ? signUp : signIn}
        className="space-y-5"
      >
        <FormLock pending={pending} className="space-y-5">
        <input type="hidden" name="next" value={next} />

        {mode === "signup" && (
          <label className="block space-y-2">
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              Full name
            </span>
            <Input
              name="full_name"
              required
              placeholder="Your full name"
              autoComplete="name"
              className="h-12 rounded-xl border-border bg-white"
            />
          </label>
        )}

        <label className="block space-y-2">
          <span className="ml-1 text-sm font-medium text-muted-foreground">
            Email Address
          </span>
          <div className="relative">
            <span className="material-symbols-outlined absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground">
              mail
            </span>
            <Input
              name="email"
              type="email"
              required
              placeholder="name@foundation.org"
              autoComplete="email"
              className="h-12 rounded-xl border-border bg-white pr-4 pl-12"
            />
          </div>
        </label>

        <label className="block space-y-2">
          <span className="ml-1 text-sm font-medium text-muted-foreground">
            {mode === "signup" ? "Create password" : "Password"}
          </span>
          <div className="relative">
            <span className="material-symbols-outlined absolute top-1/2 left-4 z-10 -translate-y-1/2 text-muted-foreground">
              lock
            </span>
            <PasswordInput
              name="password"
              required
              minLength={8}
              placeholder="••••••••"
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              className="pl-12"
            />
          </div>
        </label>

        {mode === "signup" && (
          <label className="block space-y-2">
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              Repeat password
            </span>
            <PasswordInput
              name="confirm_password"
              required
              minLength={8}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </label>
        )}

        {mode === "signin" && (
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="size-4 rounded border-border text-primary focus:ring-primary"
              />
              Remember Me
            </label>
            <Link
              href="/login?mode=forgot"
              className="text-sm font-medium text-primary hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        )}

        {state.error && (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className={cn(
            "h-12 w-full rounded-xl bg-primary text-sm font-medium shadow-lg shadow-primary/10 hover:bg-primary/90",
          )}
        >
          {pending
            ? "Please wait…"
            : mode === "signup"
              ? "Create account"
              : "Sign In"}
          <span className="material-symbols-outlined text-[18px]">
            arrow_forward
          </span>
        </Button>
        </FormLock>
      </form>

      <div className="mt-10 text-center">
        <p className="text-muted-foreground">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <Link
                href={`/login?next=${encodeURIComponent(next)}`}
                className="font-bold text-primary hover:underline"
              >
                Sign in
              </Link>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <Link
                href={`/login?mode=signup&next=${encodeURIComponent(next)}`}
                className="ml-1 font-bold text-primary hover:underline"
              >
                Join the Community
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
