import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { LoginForm } from "@/components/auth/login-form";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { PageLoader } from "@/components/brand/page-loader";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Login",
};

function AuthPanel({ mode }: { mode: string }) {
  if (mode === "forgot") return <ForgotPasswordForm />;
  if (mode === "reset") return <UpdatePasswordForm />;
  return <LoginForm />;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const params = await searchParams;
  const mode = params.mode || "signin";

  return (
    <main className="flex min-h-[100svh] flex-col overflow-hidden md:flex-row">
      <section className="auth-bg-gradient relative hidden items-center justify-center overflow-hidden p-16 md:flex md:w-1/2">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-10 max-w-lg text-center">
          <div className="mb-12 flex justify-center">
            <Image
              src="/brand/logo.png"
              alt={SITE.name}
              width={128}
              height={128}
              className="h-32 w-32 object-contain drop-shadow-2xl"
              priority
            />
          </div>
          <h1 className="font-heading mb-6 text-4xl font-bold leading-tight tracking-tight text-white lg:text-5xl">
            Shaping the Leaders of Tomorrow.
          </h1>
          <blockquote className="border-l-4 border-brand py-1 pl-6 text-left">
            <p className="text-lg leading-relaxed text-white/90 italic">
              &ldquo;Education is not merely the transmission of knowledge, but
              the foundation upon which great character and leadership are
              built.&rdquo;
            </p>
            <cite className="mt-3 block text-xs font-semibold tracking-widest text-brand uppercase not-italic">
              The Brass Foundation Ethos
            </cite>
          </blockquote>
        </div>
      </section>

      <section className="relative flex flex-1 items-center justify-center bg-surface px-4 py-16 sm:px-8">
        <div className="absolute top-8 left-8 md:hidden">
          <Image
            src="/brand/logo.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-full bg-white p-0.5"
          />
        </div>

        <div className="glass-card w-full max-w-[440px] rounded-xl p-6 sm:p-10">
          <Suspense fallback={<PageLoader label="Loading…" />}>
            <AuthPanel mode={mode} />
          </Suspense>
        </div>

        <div className="absolute bottom-8 flex w-full flex-wrap justify-center gap-4 px-4">
          <Link
            href="/contact"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Privacy Policy
          </Link>
          <Link
            href="/contact"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Terms of Service
          </Link>
          <Link
            href="/contact"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Support
          </Link>
        </div>
      </section>
    </main>
  );
}
