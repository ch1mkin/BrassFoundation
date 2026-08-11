"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { openRazorpayCheckout } from "@/components/membership/razorpay-checkout";
import { ButtonSpinner } from "@/components/ui/inline-loader";
import { cn } from "@/lib/utils";
import type { BookPurchaseStatus } from "@/lib/content/book-purchases";

type Props = {
  bookId: string;
  bookSlug: string;
  title: string;
  priceLabel: string;
  status?: BookPurchaseStatus | null;
  className?: string;
  size?: "sm" | "md";
};

export function BookBuyButton({
  bookId,
  bookSlug,
  title,
  priceLabel,
  status,
  className,
  size = "md",
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pad =
    size === "sm" ? "px-3 py-1.5 text-xs sm:px-6 sm:py-2 sm:text-sm" : "px-5 py-2 text-sm";

  if (status === "approved") {
    return (
      <a
        href={`/member/books/${bookSlug}`}
        className={cn(
          "rounded-lg bg-success px-5 py-2 text-sm font-bold text-white",
          pad,
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        Purchased · Read
      </a>
    );
  }

  if (status === "paid_awaiting_approval") {
    return (
      <span
        className={cn(
          "rounded-lg bg-muted px-5 py-2 text-sm font-bold text-muted-foreground",
          pad,
          className,
        )}
      >
        Pending
      </span>
    );
  }

  async function buy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purpose: "book_purchase",
          marketplaceItemId: bookId,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push(
          `/login?next=${encodeURIComponent(`/marketplace/${bookSlug}`)}`,
        );
        return;
      }
      if (!res.ok) {
        setError(data.error || "Could not start checkout.");
        return;
      }

      await openRazorpayCheckout({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "BRASS Foundation",
        description: `Featured book: ${title}`,
        order_id: data.orderId,
        handler: async (response) => {
          const verify = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verified = await verify.json();
          if (!verify.ok) {
            setError(verified.error || "Payment verification failed.");
            setBusy(false);
            return;
          }
          router.refresh();
          router.push("/member/books?pending=1");
        },
        onDismiss: () => setBusy(false),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={busy}
        onClick={buy}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg bg-primary font-bold text-white disabled:opacity-60",
          pad,
          className,
        )}
      >
        {busy ? (
          <>
            <ButtonSpinner />
            Paying…
          </>
        ) : (
          `Buy Now · ${priceLabel}`
        )}
      </button>
      {error ? (
        <p className="max-w-[14rem] text-right text-[11px] text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
