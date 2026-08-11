"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { Input } from "@/components/ui/input";
import { ButtonSpinner } from "@/components/ui/inline-loader";
import { DobField } from "@/components/membership/dob-field";
import { FamilyPayButton } from "@/components/membership/family-pay-button";
import {
  createFamilyMembersAction,
  type FamilyActionState,
} from "@/lib/membership/family-actions";
import {
  MEMBERSHIP_CATEGORIES,
  MEMBERSHIP_CATEGORY_LABELS,
} from "@/lib/membership/categories";
import { ageFromIsoDate } from "@/lib/membership/dob";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import {
  FAMILY_MEMBER_FEE_PAISE,
  FAMILY_MINOR_AGE,
} from "@/lib/payments/constants";

type Draft = {
  full_name: string;
  date_of_birth: string;
  gender: string;
  occupation: string;
  category: string;
};

const empty = (): Draft => ({
  full_name: "",
  date_of_birth: "",
  gender: "",
  occupation: "",
  category: "",
});

export function FamilyMembersForm() {
  const router = useRouter();
  const [rows, setRows] = useState<Draft[]>([empty()]);
  const [state, action, pending] = useSafeFormAction(
    createFamilyMembersAction,
    {} as FamilyActionState,
  );
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const estimatePaise = useMemo(
    () =>
      rows.reduce((sum, row) => {
        const age = ageFromIsoDate(row.date_of_birth);
        if (age === null || age < FAMILY_MINOR_AGE) return sum;
        return sum + FAMILY_MEMBER_FEE_PAISE;
      }, 0),
    [rows],
  );

  useEffect(() => {
    if (!state.success) return;
    setSavedNotice(state.success);
    setRows([empty()]);
    router.refresh();
  }, [state.success, state.familyIds, state.totalPaise, router]);

  return (
    <div className="space-y-4">
      {savedNotice ? (
        <div className="glass-card space-y-3 rounded-2xl p-5 text-sm">
          <p className="text-success">{savedNotice}</p>
          <p className="text-muted-foreground">
            Members are saved. You can pay for unpaid adults anytime from the
            list below — no need to pay right away.
          </p>
          {state.familyIds && state.totalPaise && state.totalPaise > 0 ? (
            <FamilyPayButton
              familyIds={state.familyIds}
              amountPaise={state.totalPaise}
              size="default"
              label={`Pay ₹${(state.totalPaise / 100).toFixed(0)} now`}
            />
          ) : null}
        </div>
      ) : null}

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
                    onClick={() =>
                      setRows((r) => r.filter((_, idx) => idx !== i))
                    }
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
                <label className="space-y-1 text-sm sm:col-span-2">
                  <span>Date of birth *</span>
                  <DobField
                    name={`date_of_birth_${i}`}
                    value={row.date_of_birth}
                    onChange={(iso) =>
                      setRows((r) =>
                        r.map((x, idx) =>
                          idx === i ? { ...x, date_of_birth: iso } : x,
                        ),
                      )
                    }
                    minAge={0}
                    maxAge={119}
                    required
                  />
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
                          idx === i
                            ? { ...x, occupation: e.target.value }
                            : x,
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
              {(() => {
                const age = ageFromIsoDate(row.date_of_birth);
                if (age !== null && age < FAMILY_MINOR_AGE) {
                  return (
                    <p className="text-xs text-success">Under 18 — no fee.</p>
                  );
                }
                if (age !== null && age >= FAMILY_MINOR_AGE) {
                  return (
                    <p className="text-xs text-muted-foreground">Fee: ₹10</p>
                  );
                }
                return null;
              })()}
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
              Estimated fee if paying now: ₹{(estimatePaise / 100).toFixed(0)}{" "}
              (you can save first and pay later)
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
    </div>
  );
}
