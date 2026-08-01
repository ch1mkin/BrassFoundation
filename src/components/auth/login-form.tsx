"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MaterialIcon } from "@/components/ui/material-icon";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

function safeNext(next: string | null) {
  if (!next || !next.startsWith("/")) return "/member";
  return next;
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const busy = pending || submitting;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      setError("Email and password are required.");
      setSubmitting(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setSubmitting(false);
        return;
      }

      // Hard navigation so session cookies are applied and pending never sticks.
      startTransition(() => {
        window.location.assign(next);
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Sign-in failed. Please try again.",
      );
      setSubmitting(false);
    }
  }

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

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
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
