"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { openRazorpayCheckout } from "@/components/membership/razorpay-checkout";
import {
  CONTRIBUTION_AMOUNTS_INR,
  formatInrFromPaise,
} from "@/lib/payments/constants";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ContributionSection({
  defaultName,
  defaultEmail,
  defaultPhone,
}: {
  defaultName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
}) {
  const [amount, setAmount] = useState<number>(500);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startMandate() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/payments/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountInr: amount }),
      });
      const json = (await res.json()) as {
        error?: string;
        subscriptionId?: string;
        keyId?: string;
        amountInr?: number;
      };
      if (!res.ok || !json.subscriptionId || !json.keyId) {
        throw new Error(json.error || "Could not start monthly mandate.");
      }

      await openRazorpayCheckout({
        key: json.keyId,
        amount: amount * 100,
        currency: "INR",
        name: SITE.name,
        description: `Monthly contribution ${formatInrFromPaise(amount * 100)}`,
        subscription_id: json.subscriptionId,
        prefill: {
          name: defaultName,
          email: defaultEmail,
          contact: defaultPhone,
        },
        handler: () => {
          setMessage(
            `Monthly mandate of ${formatInrFromPaise(amount * 100)} set up. Charges will appear in your history.`,
          );
          setBusy(false);
        },
        onDismiss: () => setBusy(false),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mandate failed.");
      setBusy(false);
    }
  }

  return (
    <section className="glass-card space-y-5 rounded-2xl p-6 sm:p-8">
      <div>
        <h2 className="font-heading text-xl font-semibold">
          Monthly contribution mandate
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose an amount. Razorpay will set up a monthly e-mandate so your
          contribution renews automatically. Manage history and one-time gifts
          from{" "}
          <a href="/member/payments" className="font-medium text-primary underline">
            Payments
          </a>
          .
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CONTRIBUTION_AMOUNTS_INR.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setAmount(value)}
            className={cn(
              "rounded-xl border px-4 py-2.5 text-sm font-semibold transition",
              amount === value
                ? "border-primary bg-primary text-white"
                : "border-input bg-white text-foreground hover:border-primary/40",
            )}
          >
            ₹{value}
          </button>
        ))}
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-success" role="status">
          {message}
        </p>
      ) : null}

      <Button
        type="button"
        size="lg"
        disabled={busy}
        onClick={startMandate}
        className="h-12 rounded-xl bg-secondary"
      >
        {busy
          ? "Opening Razorpay…"
          : `Set up ₹${amount} / month mandate`}
      </Button>
    </section>
  );
}
