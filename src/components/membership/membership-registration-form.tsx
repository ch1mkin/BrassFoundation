"use client";

import { useEffect, useMemo, useState } from "react";
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
  referralCode,
}: {
  defaults?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  referralCode?: string | null;
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

  const [fullName, setFullName] = useState(defaults?.fullName || "");
  const [email, setEmail] = useState(defaults?.email || "");
  const [phone, setPhone] = useState(defaults?.phone || "");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [avatarReady, setAvatarReady] = useState(false);

  useEffect(() => {
    if (state.applicationId && state.success) {
      setStep("pay");
    }
  }, [state.applicationId, state.success]);

  const formComplete = useMemo(() => {
    const base =
      fullName.trim().length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
      phone.trim().length >= 10 &&
      address.trim().length >= 8 &&
      ["SC", "ST", "OBC"].includes(category) &&
      consent &&
      Boolean(signature);
    if (loggedIn) return base;
    return (
      base &&
      password.length >= 8 &&
      confirmPassword.length >= 8 &&
      password === confirmPassword
    );
  }, [
    fullName,
    email,
    phone,
    address,
    category,
    consent,
    signature,
    loggedIn,
    password,
    confirmPassword,
  ]);

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
    const shareUrl =
      typeof window !== "undefined" && membershipId
        ? `${window.location.origin}/membership?ref=${encodeURIComponent(membershipId)}`
        : membershipId
          ? `/membership?ref=${encodeURIComponent(membershipId)}`
          : null;
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
        {shareUrl ? (
          <div className="mt-5 rounded-xl bg-surface-low p-4 text-left text-sm">
            <p className="font-medium text-foreground">Your referral link</p>
            <p className="mt-1 break-all text-muted-foreground">{shareUrl}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Share this link. New members who join through it are tracked under
              your Membership ID.
            </p>
          </div>
        ) : null}
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="/member"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-medium text-white"
          >
            Open member portal
          </a>
          <a
            href="/member/family"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-border px-8 text-sm font-medium"
          >
            Add family members
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
          instantly.
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
    <form action={action} className="relative space-y-6 pb-6 sm:pb-10">
      {pending ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-[1px]">
          <InlineLoader label="Creating your account…" />
        </div>
      ) : null}
      <FormLock pending={pending} className="space-y-6" label="Creating account…">
        {referralCode ? (
          <input
            type="hidden"
            name="referred_by_membership_id"
            value={referralCode}
          />
        ) : null}
        <section className="glass-card space-y-4 rounded-2xl p-6 sm:p-8">
          <h2 className="font-heading text-xl font-semibold">
            Create your membership
          </h2>
          {referralCode ? (
            <p className="rounded-xl bg-primary/10 px-3 py-2 text-sm text-primary">
              Referred by membership ID: <strong>{referralCode}</strong>
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 sm:col-span-2">
              <span className="text-sm font-medium text-foreground">
                Full name with surname *
              </span>
              <Input
                name="full_name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11 rounded-xl bg-white"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">
                Email *
              </span>
              <Input
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl bg-white"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">
                Phone number *
              </span>
              <Input
                name="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 rounded-xl bg-white"
              />
            </label>
            <label className="block space-y-2 sm:col-span-2">
              <span className="text-sm font-medium text-foreground">
                Address *
              </span>
              <textarea
                name="address"
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House / street, village or city, district, state, PIN"
                className="w-full rounded-xl border border-input bg-white px-3 py-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </label>
            <label className="block space-y-2 sm:col-span-2">
              <span className="text-sm font-medium text-foreground">
                Category *
              </span>
              <select
                name="category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm"
              >
                <option value="">Select category</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="OBC">OBC</option>
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">
                Password {loggedIn ? "(optional)" : "*"}
              </span>
              <PasswordInput
                name="password"
                required={!loggedIn}
                minLength={loggedIn ? undefined : 8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">
                Confirm password {loggedIn ? "(optional)" : "*"}
              </span>
              <PasswordInput
                name="confirm_password"
                required={!loggedIn}
                minLength={loggedIn ? undefined : 8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </label>
            <div className="sm:col-span-2">
              <SelfieField
                required={false}
                onReadyChange={setAvatarReady}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Photo is optional.
                {avatarReady ? " Photo attached." : ""}
              </p>
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
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 size-4 rounded border-border"
            />
            <span>I have read and agree to the membership consent terms.</span>
          </label>
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">
              Signature *
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

        <div className="pt-4 pb-2 sm:pt-6 sm:pb-4">
          <Button
            type="submit"
            size="lg"
            disabled={pending || !formComplete}
            className="h-12 w-full rounded-xl bg-primary px-8 sm:w-auto sm:min-w-[240px]"
          >
            {pending ? (
              <>
                <ButtonSpinner />
                Creating account…
              </>
            ) : formComplete ? (
              "Continue to ₹10 payment"
            ) : (
              "Fill all fields & sign to unlock payment"
            )}
          </Button>
        </div>
      </FormLock>
    </form>
  );
}
