"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  signInAction,
  signUpAction,
  type AuthActionState,
} from "@/lib/auth/actions";

const initialState: AuthActionState = {};

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/member";
  const mode = searchParams.get("mode") === "signup" ? "signup" : "signin";

  const [signInState, signIn, signInPending] = useActionState(
    signInAction,
    initialState,
  );
  const [signUpState, signUp, signUpPending] = useActionState(
    signUpAction,
    initialState,
  );

  const state = mode === "signup" ? signUpState : signInState;
  const pending = mode === "signup" ? signUpPending : signInPending;

  return (
    <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-soft">
      <BrandLogo size="lg" className="mx-auto" />

      <h1 className="mt-6 font-heading text-center text-2xl font-semibold">
        {mode === "signup" ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {mode === "signup"
          ? "Join Brass Foundation to access member resources and events."
          : "Sign in with your email and password."}
      </p>

      <form
        action={mode === "signup" ? signUp : signIn}
        className="mt-8 space-y-3"
      >
        <input type="hidden" name="next" value={next} />

        {mode === "signup" && (
          <Input
            name="full_name"
            placeholder="Full name"
            autoComplete="name"
            className="h-10 rounded-2xl"
          />
        )}

        <Input
          name="email"
          type="email"
          required
          placeholder="Email"
          autoComplete="email"
          className="h-10 rounded-2xl"
        />
        <Input
          name="password"
          type="password"
          required
          placeholder="Password"
          autoComplete={
            mode === "signup" ? "new-password" : "current-password"
          }
          minLength={8}
          className="h-10 rounded-2xl"
        />

        {state.error && (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="text-sm text-success" role="status">
            {state.success}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="w-full rounded-2xl"
        >
          {pending
            ? "Please wait…"
            : mode === "signup"
              ? "Create account"
              : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link
              href="/login?mode=signup"
              className="text-primary hover:underline"
            >
              Create an account
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
