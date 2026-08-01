import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShowcase } from "@/components/auth/auth-showcase";
import { LoginForm } from "@/components/auth/login-form";
import { PageLoader } from "@/components/brand/page-loader";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <div className="min-h-[100svh] bg-background">
      <div className="mx-auto grid min-h-[100svh] max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-16">
        <AuthShowcase />
        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft sm:p-10">
          <Suspense fallback={<PageLoader label="Loading secure access…" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
