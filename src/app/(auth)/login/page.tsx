import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-background px-6">
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-soft">
            <div className="h-8 w-40 rounded bg-muted" />
            <div className="mt-6 h-10 rounded-2xl bg-muted" />
            <div className="mt-3 h-10 rounded-2xl bg-muted" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
