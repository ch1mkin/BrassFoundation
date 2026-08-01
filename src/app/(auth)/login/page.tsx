import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-soft">
        <Link
          href="/"
          className="font-heading text-sm font-medium text-primary"
        >
          ← {SITE.name}
        </Link>
        <h1 className="mt-6 font-heading text-2xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Email, OTP, and Google sign-in will connect through Supabase Auth.
        </p>
        <div className="mt-8 space-y-3">
          <div className="h-10 rounded-2xl border border-border bg-muted/40" />
          <div className="h-10 rounded-2xl border border-border bg-muted/40" />
          <button
            type="button"
            disabled
            className={cn(
              buttonVariants({ size: "lg" }),
              "w-full rounded-2xl opacity-70",
            )}
          >
            Sign in (coming soon)
          </button>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/membership" className="text-primary hover:underline">
            Become a member
          </Link>
        </p>
      </div>
    </div>
  );
}
