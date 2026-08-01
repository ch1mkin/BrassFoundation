"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/brand/logo";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  resendSignupOtpAction,
  sendSignupOtpAction,
  signInWithPhoneAction,
  verifySignupOtpAction,
  type AuthActionState,
} from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

const initial: AuthActionState = { step: "credentials" };

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/member";
  const mode = searchParams.get("mode") === "signup" ? "signup" : "signin";

  const [signInState, signIn, signInPending] = useActionState(
    signInWithPhoneAction,
    initial,
  );
  const [otpSendState, sendOtp, sendPending] = useActionState(
    sendSignupOtpAction,
    initial,
  );
  const [verifyState, verifyOtp, verifyPending] = useActionState(
    verifySignupOtpAction,
    initial,
  );

  const [signupStep, setSignupStep] = useState<"credentials" | "otp">(
    "credentials",
  );
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendPending, startResend] = useTransition();

  useEffect(() => {
    if (otpSendState.step === "otp" && otpSendState.phone) {
      setSignupStep("otp");
      setPhone(otpSendState.phone);
    }
  }, [otpSendState]);

  const signupError =
    signupStep === "otp"
      ? verifyState.error || otpSendState.error
      : otpSendState.error;
  const signupSuccess =
    signupStep === "otp"
      ? verifyState.success || otpSendState.success || resendMessage
      : null;

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 lg:hidden">
        <BrandLogo size="md" />
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

      <h1 className="font-heading mt-8 text-3xl font-medium tracking-tight">
        {mode === "signup"
          ? signupStep === "otp"
            ? "Verify your phone"
            : "Create your account"
          : "Welcome back"}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {mode === "signup"
          ? signupStep === "otp"
            ? `Enter the OTP sent to ${phone}. Then your account will be ready.`
            : "Register with your mobile number. We’ll verify it with an OTP before activating your account."
          : "Sign in with your registered mobile number and password."}
      </p>

      {mode === "signin" ? (
        <form action={signIn} className="mt-8 space-y-4">
          <input type="hidden" name="next" value={next} />
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
            <span className="text-sm font-medium">Password</span>
            <PasswordInput
              name="password"
              required
              minLength={8}
              placeholder="Your password"
              autoComplete="current-password"
            />
          </label>

          {signInState.error && (
            <p className="text-sm text-destructive" role="alert">
              {signInState.error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={signInPending}
            className="h-11 w-full rounded-2xl"
          >
            {signInPending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      ) : signupStep === "credentials" ? (
        <form action={sendOtp} className="mt-8 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Full name</span>
            <Input
              name="full_name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              autoComplete="name"
              className="h-11 rounded-2xl"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Phone number</span>
            <Input
              name="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              autoComplete="tel"
              className="h-11 rounded-2xl"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Create password</span>
            <PasswordInput
              name="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
          </label>
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

          {signupError && (
            <p className="text-sm text-destructive" role="alert">
              {signupError}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={sendPending}
            className="h-11 w-full rounded-2xl bg-gold text-gold-foreground hover:bg-gold/90"
          >
            {sendPending ? "Sending OTP…" : "Send OTP & continue"}
          </Button>
        </form>
      ) : (
        <form action={verifyOtp} className="mt-8 space-y-4">
          <input type="hidden" name="next" value={next} />
          <input type="hidden" name="phone" value={phone} />
          <input type="hidden" name="full_name" value={fullName} />
          <input type="hidden" name="password" value={password} />

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">OTP code</span>
            <Input
              name="otp"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              maxLength={8}
              placeholder="Enter 6-digit OTP"
              autoComplete="one-time-code"
              className="h-11 rounded-2xl tracking-[0.3em]"
            />
          </label>

          {signupError && (
            <p className="text-sm text-destructive" role="alert">
              {signupError}
            </p>
          )}
          {signupSuccess && (
            <p className="text-sm text-success" role="status">
              {signupSuccess}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={verifyPending}
            className="h-11 w-full rounded-2xl bg-gold text-gold-foreground hover:bg-gold/90"
          >
            {verifyPending ? "Confirming…" : "Verify & create account"}
          </Button>

          <div className="flex items-center justify-between gap-3 text-sm">
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSignupStep("credentials");
                setResendMessage(null);
              }}
            >
              ← Edit details
            </button>
            <button
              type="button"
              disabled={resendPending}
              className="font-medium text-primary hover:underline disabled:opacity-60"
              onClick={() => {
                startResend(async () => {
                  const result = await resendSignupOtpAction(phone);
                  setResendMessage(
                    result.success || result.error || "OTP resent.",
                  );
                });
              }}
            >
              {resendPending ? "Resending…" : "Resend OTP"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
