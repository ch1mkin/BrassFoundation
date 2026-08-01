"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/password-input";
import { SignaturePad } from "@/components/membership/signature-pad";
import { openRazorpayCheckout } from "@/components/membership/razorpay-checkout";
import { ContributionSection } from "@/components/membership/contribution-section";
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

export function MembershipRegistrationForm() {
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
      <div className="space-y-8">
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
          <a
            href="/member"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-medium text-white"
          >
            Open member portal
          </a>
        </div>
        <ContributionSection
          defaultName={state.fullName}
          defaultEmail={state.email}
          defaultPhone={state.phone}
        />
      </div>
    );
  }

  if (step === "pay") {
    return (
      <div className="glass-card space-y-5 rounded-2xl p-6 sm:p-8">
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
          onClick={startPayment}
          className="h-12 rounded-xl bg-primary"
        >
          {paying ? "Opening Razorpay…" : "Pay ₹10 & join"}
        </Button>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6">
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
                Password *
              </span>
              <PasswordInput name="password" required minLength={8} />
            </label>
            <label className="block space-y-2">
              <span className="ml-1 text-sm font-medium text-muted-foreground">
                Confirm password *
              </span>
              <PasswordInput name="confirm_password" required minLength={8} />
            </label>
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
              Digital signature *
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
          {pending ? "Creating account…" : "Continue to ₹10 payment"}
        </Button>
      </FormLock>
    </form>
  );
}
