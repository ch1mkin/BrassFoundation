"use client";

import { useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { Input } from "@/components/ui/input";
import { ButtonSpinner } from "@/components/ui/inline-loader";
import { openRazorpayCheckout } from "@/components/membership/razorpay-checkout";
import {
  createFamilyMembersAction,
  type FamilyActionState,
} from "@/lib/membership/family-actions";
import {
  MEMBERSHIP_CATEGORIES,
  MEMBERSHIP_CATEGORY_LABELS,
} from "@/lib/membership/categories";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import {
  FAMILY_MEMBER_FEE_PAISE,
  FAMILY_MINOR_AGE,
} from "@/lib/payments/constants";
import { SITE } from "@/lib/constants";
import { bumpLiveMemberCount } from "@/lib/membership/member-count-client";

type Draft = {
  full_name: string;
  age: string;
  gender: string;
  occupation: string;
  category: string;
};

const empty = (): Draft => ({
  full_name: "",
  age: "",
  gender: "",
  occupation: "",
  category: "",
});

export function FamilyMembersForm() {
  const [rows, setRows] = useState<Draft[]>([empty()]);
  const [state, action, pending] = useSafeFormAction(
    createFamilyMembersAction,
    {} as FamilyActionState,
  );
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const estimatePaise = useMemo(
    () =>
      rows.reduce((sum, row) => {
        const age = Number(row.age || 0);
        if (!age || age < FAMILY_MINOR_AGE) return sum;
        return sum + FAMILY_MEMBER_FEE_PAISE;
      }, 0),
    [rows],
  );

  async function payForFamily(familyIds: string[], totalPaise: number) {
    setPaying(true);
    setPayError(null);
    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purpose: "family_registration",
          amountPaise: totalPaise,
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
        amount: Number(json.amount || totalPaise),
        currency: json.currency || "INR",
        name: SITE.name,
        description: `Family membership fees (₹${(totalPaise / 100).toFixed(0)})`,
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
            setPayError(verified.error || "Payment verification failed.");
            setPaying(false);
            return;
          }
          setDone(true);
          bumpLiveMemberCount();
          confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } });
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
      <div className="glass-card rounded-2xl p-6 text-success">
        Family members registered successfully.
      </div>
    );
  }

  if (state.familyIds && state.totalPaise && state.totalPaise > 0 && !done) {
    return (
      <div className="glass-card space-y-4 rounded-2xl p-6">
        <p className="text-sm text-foreground">{state.success}</p>
        {payError ? <p className="text-sm text-destructive">{payError}</p> : null}
        <Button
          type="button"
          disabled={paying}
          className="rounded-xl bg-primary"
          onClick={() =>
            void payForFamily(state.familyIds || [], state.totalPaise || 0)
          }
        >
          {paying ? (
            <>
              <ButtonSpinner />
              Opening Razorpay…
            </>
          ) : (
            `Pay ₹${((state.totalPaise || 0) / 100).toFixed(0)}`
          )}
        </Button>
      </div>
    );
  }

  if (state.success && (!state.totalPaise || state.totalPaise === 0)) {
    return (
      <div className="glass-card rounded-2xl p-6 text-success">{state.success}</div>
    );
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="member_count" value={rows.length} />
      <FormLock pending={pending} className="space-y-6">
        {rows.map((row, i) => (
          <div key={i} className="glass-card space-y-3 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold">
                Family member {i + 1}
              </h3>
              {rows.length > 1 ? (
                <button
                  type="button"
                  className="text-xs font-semibold text-destructive"
                  onClick={() => setRows((r) => r.filter((_, idx) => idx !== i))}
                >
                  Remove
                </button>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-sm sm:col-span-2">
                <span>Full name with surname *</span>
                <Input
                  name={`full_name_${i}`}
                  required
                  value={row.full_name}
                  onChange={(e) =>
                    setRows((r) =>
                      r.map((x, idx) =>
                        idx === i ? { ...x, full_name: e.target.value } : x,
                      ),
                    )
                  }
                  className="h-11 rounded-xl"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span>Age *</span>
                <div className="relative">
                  <Input
                    name={`age_${i}`}
                    type="number"
                    min={1}
                    max={119}
                    required
                    value={row.age}
                    onChange={(e) =>
                      setRows((r) =>
                        r.map((x, idx) =>
                          idx === i ? { ...x, age: e.target.value } : x,
                        ),
                      )
                    }
                    className="h-11 rounded-xl pr-16"
                    aria-describedby={`age-years-suffix-${i}`}
                  />
                  <span
                    id={`age-years-suffix-${i}`}
                    className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground"
                  >
                    years
                  </span>
                </div>
              </label>
              <label className="space-y-1 text-sm">
                <span>Gender *</span>
                <select
                  name={`gender_${i}`}
                  required
                  value={row.gender}
                  onChange={(e) =>
                    setRows((r) =>
                      r.map((x, idx) =>
                        idx === i ? { ...x, gender: e.target.value } : x,
                      ),
                    )
                  }
                  className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm"
                >
                  <option value="">Select</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label className="space-y-1 text-sm">
                <span>Occupation</span>
                <Input
                  name={`occupation_${i}`}
                  value={row.occupation}
                  onChange={(e) =>
                    setRows((r) =>
                      r.map((x, idx) =>
                        idx === i ? { ...x, occupation: e.target.value } : x,
                      ),
                    )
                  }
                  className="h-11 rounded-xl"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span>Category *</span>
                <select
                  name={`category_${i}`}
                  required
                  value={row.category}
                  onChange={(e) =>
                    setRows((r) =>
                      r.map((x, idx) =>
                        idx === i ? { ...x, category: e.target.value } : x,
                      ),
                    )
                  }
                  className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm"
                >
                  <option value="">Select</option>
                  {MEMBERSHIP_CATEGORIES.map((value) => (
                    <option key={value} value={value}>
                      {MEMBERSHIP_CATEGORY_LABELS[value]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {Number(row.age) > 0 && Number(row.age) < FAMILY_MINOR_AGE ? (
              <p className="text-xs text-success">Under 18 — no fee.</p>
            ) : Number(row.age) >= FAMILY_MINOR_AGE ? (
              <p className="text-xs text-muted-foreground">Fee: ₹10</p>
            ) : null}
          </div>
        ))}

        <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-border/60 pt-6">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl px-5"
            onClick={() => setRows((r) => [...r, empty()])}
          >
            Add another member
          </Button>
          <p className="text-sm text-muted-foreground">
            Estimated total: ₹{(estimatePaise / 100).toFixed(0)}
          </p>
        </div>

        {state.error ? (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={pending}
          className="h-12 rounded-xl bg-primary"
        >
          {pending ? (
            <>
              <ButtonSpinner />
              Saving…
            </>
          ) : (
            "Save family members"
          )}
        </Button>
      </FormLock>
    </form>
  );
}
