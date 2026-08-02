"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { InlineLoader, ButtonSpinner } from "@/components/ui/inline-loader";
import { openRazorpayCheckout } from "@/components/membership/razorpay-checkout";
import { SITE } from "@/lib/constants";
import { REGISTRATION_FEE_PAISE } from "@/lib/payments/constants";

export function MembershipPayStep({
  applicationId,
  fullName,
  email,
  phone,
}: {
  applicationId: string;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
}) {
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [membershipId, setMembershipId] = useState<string | null>(null);

  async function startPayment() {
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
          name: fullName || undefined,
          email: email || undefined,
          contact: phone || undefined,
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
          setDone(true);
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

  if (done) {
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
          Monthly mandates are available in your member payments panel.
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
        Your account is ready. Complete the secure Razorpay payment to activate
        membership instantly.
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
