"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { Input } from "@/components/ui/input";
import { MaterialIcon } from "@/components/ui/material-icon";
import { signInAction, type AuthActionState } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

const initial: AuthActionState = {};

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/member";
  const [state, signIn, pending] = useActionState(signInAction, initial);

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

      <form action={signIn} className="space-y-5">
        <FormLock pending={pending} className="space-y-5">
          <input type="hidden" name="next" value={next} />

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
                placeholder="name@foundation.org"
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
            <Link
              href="/login?mode=forgot"
              className="text-sm font-medium text-primary hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

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
            {pending ? "Please wait…" : "Sign In"}
            <MaterialIcon name="arrow_forward" className="text-[18px]" />
          </Button>
        </FormLock>
      </form>

      <div className="mt-10 text-center">
        <p className="text-muted-foreground">
          New here?{" "}
          <Link
            href="/membership"
            className="font-bold text-primary hover:underline"
          >
            Become a member
          </Link>
        </p>
      </div>
    </div>
  );
}
