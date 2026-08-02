"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { InlineLoader, ButtonSpinner } from "@/components/ui/inline-loader";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/password-input";
import { SignaturePad } from "@/components/membership/signature-pad";
import { SelfieField } from "@/components/membership/selfie-field";
import { openRazorpayCheckout } from "@/components/membership/razorpay-checkout";
import {
  MEMBERSHIP_CONSENT_TEXT,
  MEMBERSHIP_CONSENT_VERSION,
} from "@/lib/membership/consent";
import {
  registerMembershipAction,
  type RegisterMembershipState,
} from "@/lib/membership/register-action";
import { SITE } from "@/lib/constants";
import { REGISTRATION_FEE_PAISE } from "@/lib/payments/constants";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";

const initial: RegisterMembershipState = {};

export function MembershipRegistrationForm({
  defaults,
}: {
  defaults?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
}) {
  const loggedIn = Boolean(defaults?.email);
  const [state, action, pending] = useSafeFormAction(
    registerMembershipAction,
    initial,
  );
  const [signature, setSignature] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "pay" | "done">("form");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [membershipId, setMembershipId] = useState<string | null>(null);

  useEffect(() => {
    if (state.applicationId && state.success) {
      setStep("pay");
    }
  }, [state.applicationId, state.success]);

  async function startPayment() {
    const applicationId = state.applicationId;
    if (!applicationId) {
      setPayError("Missing application. Please submit the form again.");
      return;
    }
    setPaying(true);
    setPayError(null);
    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purpose: "registration_fee",
          applicationId,
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        orderId?: string;
        amount?: number;
        currency?: string;
        keyId?: string;
      };
      if (!res.ok || !json.orderId || !json.keyId) {
        throw new Error(json.error || "Could not start payment.");
      }

      await openRazorpayCheckout({
        key: json.keyId,
        amount: Number(json.amount || REGISTRATION_FEE_PAISE),
        currency: json.currency || "INR",
        name: SITE.name,
        description: "Membership registration fee (₹10)",
        order_id: json.orderId,
        prefill: {
          name: state.fullName,
          email: state.email,
          contact: state.phone,
        },
        handler: async (response) => {
          const verify = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              applicationId,
            }),
          });
          const verified = (await verify.json()) as {
            ok?: boolean;
            membershipId?: string;
            error?: string;
          };
          if (!verify.ok || !verified.ok) {
            setPayError(verified.error || "Payment verification failed.");
            setPaying(false);
            return;
          }
          setMembershipId(verified.membershipId || null);
          setStep("done");
          confetti({ particleCount: 140, spread: 70, origin: { y: 0.65 } });
          confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 } });
          confetti({
            particleCount: 80,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
          setPaying(false);
        },
        onDismiss: () => setPaying(false),
      });
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Payment failed.");
      setPaying(false);
    }
  }

  if (step === "done") {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <p className="font-heading text-3xl font-semibold text-primary">
          Welcome, member!
        </p>
        <p className="mt-3 text-muted-foreground">
          Your registration payment is complete and membership is active.
        </p>
        {membershipId ? (
          <p className="mt-4 text-sm font-semibold text-foreground">
            Membership ID: {membershipId}
          </p>
        ) : null}
        <p className="mt-4 text-sm text-muted-foreground">
          Set up a monthly contribution anytime from your member payments panel.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="/member"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-medium text-white"
          >
            Open member portal
          </a>
          <a
            href="/member/payments"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-border px-8 text-sm font-medium"
          >
            Set up monthly mandate
          </a>
        </div>
      </div>
    );
  }

  if (step === "pay") {
    return (
      <div className="glass-card relative space-y-5 rounded-2xl p-6 sm:p-8">
        {paying ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-[1px]">
            <InlineLoader label="Opening secure payment…" />
          </div>
        ) : null}
        <h2 className="font-heading text-xl font-semibold">
          Pay registration fee (₹10)
        </h2>
        <p className="text-sm text-muted-foreground">
          Complete the secure Razorpay payment to activate your membership
          instantly. No guest accounts — this fee finalises your membership.
        </p>
        {payError ? (
          <p className="text-sm text-destructive" role="alert">
            {payError}
          </p>
        ) : null}
        <Button
          type="button"
          size="lg"
          disabled={paying}
          onClick={() => void startPayment()}
          className="h-12 rounded-xl bg-primary"
        >
          {paying ? (
            <>
              <ButtonSpinner />
              Opening Razorpay…
            </>
          ) : (
            "Pay ₹10 & join"
          )}
        </Button>
      </div>
    );
  }

  return (
    <form action={action} className="relative space-y-6">
      {pending ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-[1px]">
          <InlineLoader label="Creating your account…" />
        </div>
      ) : null}
      <FormLock pending={pending} className="space-y-6">
        <section className="glass-card space-y-4 rounded-2xl p-6 sm:p-8">
          <h2 className="font-heading text-xl font-semibold">
            Create your membership
          </h2>
          <p className="text-sm text-muted-foreground">
            Registration is membership only — fill your details, sign consent,
            then pay ₹10.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 sm:col-span-2">
              <span className="ml-1 text-sm font-medium text-muted-foreground">
                Full name *
              </span>
              <Input
                name="full_name"
                required
                defaultValue={defaults?.fullName || ""}
                className="h-11 rounded-xl bg-white"
              />
            </label>
            <label className="block space-y-2">
              <span className="ml-1 text-sm font-medium text-muted-foreground">
                Email *
              </span>
              <Input
                name="email"
                type="email"
                required
                defaultValue={defaults?.email || ""}
                className="h-11 rounded-xl bg-white"
              />
            </label>
            <label className="block space-y-2">
              <span className="ml-1 text-sm font-medium text-muted-foreground">
                Mobile number *
              </span>
              <Input
                name="phone"
                type="tel"
                required
                defaultValue={defaults?.phone || ""}
                className="h-11 rounded-xl bg-white"
              />
            </label>
            <label className="block space-y-2 sm:col-span-2">
              <span className="ml-1 text-sm font-medium text-muted-foreground">
                Government / ID number *
              </span>
              <Input
                name="government_id"
                required
                placeholder="Aadhaar / Voter ID / Passport / other"
                className="h-11 rounded-xl bg-white"
              />
            </label>
            <label className="block space-y-2">
              <span className="ml-1 text-sm font-medium text-muted-foreground">
                Password {loggedIn ? "(optional)" : "*"}
              </span>
              <PasswordInput
                name="password"
                required={!loggedIn}
                minLength={loggedIn ? undefined : 8}
              />
            </label>
            <label className="block space-y-2">
              <span className="ml-1 text-sm font-medium text-muted-foreground">
                Confirm password {loggedIn ? "(optional)" : "*"}
              </span>
              <PasswordInput
                name="confirm_password"
                required={!loggedIn}
                minLength={loggedIn ? undefined : 8}
              />
            </label>
            <div className="sm:col-span-2">
              <SelfieField required />
            </div>
          </div>
        </section>

        <section className="glass-card space-y-4 rounded-2xl p-6 sm:p-8">
          <h2 className="font-heading text-xl font-semibold">
            Consent form (v{MEMBERSHIP_CONSENT_VERSION})
          </h2>
          <div className="max-h-48 overflow-y-auto rounded-xl bg-surface-low p-4 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
            {MEMBERSHIP_CONSENT_TEXT}
          </div>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="consent"
              required
              className="mt-1 size-4 rounded border-border"
            />
            <span>I have read and agree to the membership consent terms.</span>
          </label>
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Signature *
            </p>
            <p className="mb-3 text-xs text-muted-foreground">
              Draw your signature, or take / upload a photo of a handwritten
              signature (auto-cropped to signature size).
            </p>
            <SignaturePad onChange={setSignature} />
            <input
              type="hidden"
              name="signature_data_url"
              value={signature || ""}
            />
          </div>
        </section>

        {state.error ? (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={pending || !signature}
          className="h-12 rounded-xl bg-primary px-8"
        >
          {pending ? (
            <>
              <ButtonSpinner />
              Creating account…
            </>
          ) : (
            "Continue to ₹10 payment"
          )}
        </Button>
      </FormLock>
    </form>
  );
}
