"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/brand/logo";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  signInWithPhoneAction,
  signUpWithPhoneAction,
  type AuthActionState,
} from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

const initial: AuthActionState = {};

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/member";
  const mode = searchParams.get("mode") === "signup" ? "signup" : "signin";

  const [signInState, signIn, signInPending] = useActionState(
    signInWithPhoneAction,
    initial,
  );
  const [signUpState, signUp, signUpPending] = useActionState(
    signUpWithPhoneAction,
    initial,
  );

  const state = mode === "signup" ? signUpState : signInState;
  const pending = mode === "signup" ? signUpPending : signInPending;

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 lg:hidden">
        <BrandLogo size="md" showWordmark />
      </div>

      <div className="flex gap-2 rounded-2xl bg-muted p-1">
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className={cn(
            "flex-1 rounded-xl py-2 text-center text-sm font-medium transition-colors",
            mode === "signin"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Sign in
        </Link>
        <Link
          href={`/login?mode=signup&next=${encodeURIComponent(next)}`}
          className={cn(
            "flex-1 rounded-xl py-2 text-center text-sm font-medium transition-colors",
            mode === "signup"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Register
        </Link>
      </div>

      <h1 className="font-heading mt-8 text-3xl font-normal tracking-tight">
        {mode === "signup" ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {mode === "signup"
          ? "Register with your mobile number and a secure password."
          : "Sign in with your registered mobile number and password."}
      </p>

      <form
        action={mode === "signup" ? signUp : signIn}
        className="mt-8 space-y-4"
      >
        <input type="hidden" name="next" value={next} />

        {mode === "signup" && (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Full name</span>
            <Input
              name="full_name"
              required
              placeholder="Your full name"
              autoComplete="name"
              className="h-11 rounded-2xl"
            />
          </label>
        )}

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Phone number</span>
          <Input
            name="phone"
            type="tel"
            required
            placeholder="9876543210"
            autoComplete="tel"
            className="h-11 rounded-2xl"
          />
          <span className="text-xs text-muted-foreground">
            India numbers default to +91
          </span>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">
            {mode === "signup" ? "Create password" : "Password"}
          </span>
          <PasswordInput
            name="password"
            required
            minLength={8}
            placeholder={
              mode === "signup" ? "At least 8 characters" : "Your password"
            }
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
          />
        </label>

        {mode === "signup" && (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Repeat password</span>
            <PasswordInput
              name="confirm_password"
              required
              minLength={8}
              placeholder="Re-enter password"
              autoComplete="new-password"
            />
          </label>
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
            "h-11 w-full rounded-2xl",
            mode === "signup" &&
              "bg-gold text-gold-foreground hover:bg-gold/90",
          )}
        >
          {pending
            ? "Please wait…"
            : mode === "signup"
              ? "Create account"
              : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
