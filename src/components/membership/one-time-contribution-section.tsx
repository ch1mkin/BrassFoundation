"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { openRazorpayCheckout } from "@/components/membership/razorpay-checkout";
import {
  CONTRIBUTION_AMOUNTS_INR,
  formatInrFromPaise,
} from "@/lib/payments/constants";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const MIN_INR = 100;
const MAX_NOTE = 280;

export function OneTimeContributionSection({
  defaultName,
  defaultEmail,
  defaultPhone,
}: {
  defaultName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
}) {
  const [amountInr, setAmountInr] = useState<string>("500");
  const [note, setNote] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parsedAmount = useMemo(() => {
    const n = Number(amountInr);
    return Number.isFinite(n) ? Math.floor(n) : NaN;
  }, [amountInr]);

  const amountValid =
    Number.isInteger(parsedAmount) && parsedAmount >= MIN_INR;
  const noteTrimmed = note.trim();
  const noteValid = noteTrimmed.length >= 3 && noteTrimmed.length <= MAX_NOTE;
  const formValid = amountValid && noteValid;

  function goToConfirm() {
    setError(null);
    setMessage(null);
    if (!amountValid) {
      setError(`Enter an amount of at least ₹${MIN_INR}.`);
      return;
    }
    if (!noteValid) {
      setError("Add a short note (3–280 characters) describing this contribution.");
      return;
    }
    setConfirming(true);
  }

  async function payWithRazorpay() {
    if (!formValid) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const amountPaise = parsedAmount * 100;
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purpose: "contribution",
          amountPaise,
          note: noteTrimmed,
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
        throw new Error(json.error || "Could not start contribution payment.");
      }

      await openRazorpayCheckout({
        key: json.keyId,
        amount: Number(json.amount || amountPaise),
        currency: json.currency || "INR",
        name: SITE.name,
        description: `One-time contribution — ${noteTrimmed.slice(0, 80)}`,
        order_id: json.orderId,
        prefill: {
          name: defaultName,
          email: defaultEmail,
          contact: defaultPhone,
        },
        handler: async (response) => {
          const verify = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verified = (await verify.json()) as {
            ok?: boolean;
            error?: string;
          };
          if (!verify.ok || !verified.ok) {
            setError(verified.error || "Payment verification failed.");
            setBusy(false);
            return;
          }
          setMessage(
            `Thank you — ${formatInrFromPaise(amountPaise)} contributed. It will appear in your history.`,
          );
          setConfirming(false);
          setNote("");
          setBusy(false);
        },
        onDismiss: () => setBusy(false),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed.");
      setBusy(false);
    }
  }

  return (
    <section className="glass-card space-y-5 rounded-2xl p-6 sm:p-8">
      <div>
        <h2 className="font-heading text-xl font-semibold">
          One-time contribution
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter any amount (minimum ₹{MIN_INR}), add a note for what this gift
          supports, confirm, then pay securely with Razorpay. For a renewing
          monthly e-mandate, use{" "}
          <a href="/membership" className="font-medium text-primary underline">
            Contribute on Membership
          </a>
          .
        </p>
      </div>

      {!confirming ? (
        <>
          <div className="flex flex-wrap gap-2">
            {CONTRIBUTION_AMOUNTS_INR.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmountInr(String(value))}
                className={cn(
                  "rounded-xl border px-4 py-2.5 text-sm font-semibold transition",
                  parsedAmount === value
                    ? "border-primary bg-primary text-white"
                    : "border-input bg-white text-foreground hover:border-primary/40",
                )}
              >
                ₹{value}
              </button>
            ))}
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">
              Amount (₹) *
            </span>
            <Input
              type="number"
              min={MIN_INR}
              step={1}
              inputMode="numeric"
              value={amountInr}
              onChange={(e) => setAmountInr(e.target.value)}
              className="h-11 rounded-xl bg-white"
              placeholder={`Minimum ${MIN_INR}`}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">
              Note — what is this for? *
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, MAX_NOTE))}
              rows={3}
              required
              maxLength={MAX_NOTE}
              placeholder="e.g. Education kit for village library, general fund, event support…"
              className="w-full rounded-xl border border-input bg-white px-3 py-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <span className="text-xs text-muted-foreground">
              {noteTrimmed.length}/{MAX_NOTE}
            </span>
          </label>

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
            onClick={goToConfirm}
            className="h-12 rounded-xl bg-secondary"
          >
            Continue to confirm
          </Button>
        </>
      ) : (
        <div className="space-y-4 rounded-xl border border-border bg-surface-low p-4">
          <p className="text-sm font-medium text-foreground">
            Confirm your donation
          </p>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Amount</dt>
              <dd className="font-semibold">
                {formatInrFromPaise(parsedAmount * 100)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Note</dt>
              <dd className="mt-1 font-medium text-foreground">{noteTrimmed}</dd>
            </div>
          </dl>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => {
                setConfirming(false);
                setError(null);
              }}
              className="h-11 rounded-xl"
            >
              Edit
            </Button>
            <Button
              type="button"
              size="lg"
              disabled={busy}
              onClick={payWithRazorpay}
              className="h-11 rounded-xl bg-secondary"
            >
              {busy
                ? "Opening Razorpay…"
                : `Donate ${formatInrFromPaise(parsedAmount * 100)}`}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
