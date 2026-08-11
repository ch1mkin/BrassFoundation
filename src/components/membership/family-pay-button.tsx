"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { ButtonSpinner } from "@/components/ui/inline-loader";
import { openRazorpayCheckout } from "@/components/membership/razorpay-checkout";
import { SITE } from "@/lib/constants";
import { bumpLiveMemberCount } from "@/lib/membership/member-count-client";
import { cn } from "@/lib/utils";

export function FamilyPayButton({
  familyIds,
  amountPaise,
  label,
  className,
  size = "sm",
}: {
  familyIds: string[];
  amountPaise: number;
  label?: string;
  className?: string;
  size?: "sm" | "default" | "lg";
}) {
  const router = useRouter();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!familyIds.length || amountPaise < 1000) return null;

  async function pay() {
    setPaying(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purpose: "family_registration",
          amountPaise,
          familyMemberIds: familyIds,
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
        amount: Number(json.amount || amountPaise),
        currency: json.currency || "INR",
        name: SITE.name,
        description: `Family membership fees (₹${(amountPaise / 100).toFixed(0)})`,
        order_id: json.orderId,
        handler: async (response) => {
          const verify = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              familyMemberIds: familyIds,
            }),
          });
          const verified = (await verify.json()) as {
            ok?: boolean;
            error?: string;
          };
          if (!verify.ok || !verified.ok) {
            setError(verified.error || "Payment verification failed.");
            setPaying(false);
            return;
          }
          bumpLiveMemberCount();
          confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } });
          setPaying(false);
          router.refresh();
        },
        onDismiss: () => setPaying(false),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed.");
      setPaying(false);
    }
  }

  const defaultLabel = `Pay ₹${(amountPaise / 100).toFixed(0)}`;

  return (
    <div className="space-y-1">
      <Button
        type="button"
        size={size}
        disabled={paying}
        onClick={() => void pay()}
        className={cn("rounded-xl bg-primary", className)}
      >
        {paying ? (
          <>
            <ButtonSpinner />
            Opening Razorpay…
          </>
        ) : (
          label || defaultLabel
        )}
      </Button>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
