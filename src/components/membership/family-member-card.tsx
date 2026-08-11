"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLock } from "@/components/ui/form-lock";
import { ButtonSpinner } from "@/components/ui/inline-loader";
import { DobField } from "@/components/membership/dob-field";
import { FamilyPayButton } from "@/components/membership/family-pay-button";
import {
  MEMBERSHIP_CATEGORIES,
  MEMBERSHIP_CATEGORY_LABELS,
} from "@/lib/membership/categories";
import {
  deleteFamilyMemberAction,
  updateFamilyMemberAction,
  type FamilyMemberMutationState,
} from "@/lib/membership/family-actions";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import { formatInrFromPaise } from "@/lib/payments/constants";
import { bumpLiveMemberCount } from "@/lib/membership/member-count-client";
import { cn } from "@/lib/utils";

export type FamilyMemberCardData = {
  id: string;
  full_name: string;
  age: number | null;
  date_of_birth: string | null;
  gender: string | null;
  occupation: string | null;
  category: string | null;
  payment_status: string | null;
  membership_id: string | null;
  fee_paise: number | null;
};

function isPayableStatus(status: string | null | undefined) {
  return status === "unpaid" || status === "pending";
}

export function FamilyMemberCard({ member }: { member: FamilyMemberCardData }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(member.full_name);
  const [dateOfBirth, setDateOfBirth] = useState(member.date_of_birth || "");
  const [gender, setGender] = useState(member.gender || "");
  const [occupation, setOccupation] = useState(member.occupation || "");
  const [category, setCategory] = useState(
    (member.category || "").toUpperCase(),
  );

  const [updateState, updateAction, updatePending] = useSafeFormAction(
    updateFamilyMemberAction,
    {} as FamilyMemberMutationState,
  );
  const [deleteState, deleteAction, deletePending] = useSafeFormAction(
    deleteFamilyMemberAction,
    {} as FamilyMemberMutationState,
  );

  const pending = updatePending || deletePending;
  const payable = isPayableStatus(member.payment_status);
  const fee = member.fee_paise || 0;

  useEffect(() => {
    if (!editing) {
      setFullName(member.full_name);
      setDateOfBirth(member.date_of_birth || "");
      setGender(member.gender || "");
      setOccupation(member.occupation || "");
      setCategory((member.category || "").toUpperCase());
    }
  }, [member, editing]);

  useEffect(() => {
    if (!updateState.success) return;
    setEditing(false);
    bumpLiveMemberCount();
    router.refresh();
  }, [updateState.success, router]);

  useEffect(() => {
    if (!deleteState.success) return;
    bumpLiveMemberCount();
    router.refresh();
  }, [deleteState.success, router]);

  if (deleteState.success) {
    return (
      <div className="glass-card rounded-2xl p-4 text-sm text-success">
        {deleteState.success}
      </div>
    );
  }

  return (
    <div className="glass-card space-y-3 rounded-2xl p-4 text-sm">
      {!editing ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="font-medium text-foreground">{member.full_name}</p>
            <p className="text-muted-foreground">
              Age {member.age ?? "—"} · {member.gender || "—"} ·{" "}
              {member.category || "—"}
              {member.membership_id ? ` · ${member.membership_id}` : ""}
            </p>
            {member.occupation ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {member.occupation}
              </p>
            ) : null}
            <p className="mt-1 text-xs">
              <span
                className={
                  member.payment_status === "paid" ||
                  member.payment_status === "waived"
                    ? "font-semibold text-success"
                    : "font-semibold text-amber-700"
                }
              >
                {member.payment_status}
              </span>
              {payable && fee > 0
                ? ` · ${formatInrFromPaise(fee)} due`
                : null}
            </p>
            {updateState.success ? (
              <p className="mt-2 text-xs font-medium text-success" role="status">
                {updateState.success}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {payable && fee > 0 ? (
              <FamilyPayButton
                familyIds={[member.id]}
                amountPaise={fee}
                label={`Pay ${formatInrFromPaise(fee)}`}
              />
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={pending}
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
            <form
              action={deleteAction}
              onSubmit={(e) => {
                if (
                  !window.confirm(
                    `Remove ${member.full_name} from your family list?`,
                  )
                ) {
                  e.preventDefault();
                }
              }}
            >
              <FormLock pending={deletePending} label="Removing…">
                <input type="hidden" name="id" value={member.id} />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  className="rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10"
                >
                  {deletePending ? (
                    <span className="inline-flex items-center gap-1.5">
                      <ButtonSpinner />
                      Removing…
                    </span>
                  ) : (
                    "Remove"
                  )}
                </Button>
              </FormLock>
            </form>
          </div>
        </div>
      ) : (
        <form action={updateAction} className="space-y-4">
          <FormLock pending={updatePending} className="space-y-4" label="Saving…">
            <input type="hidden" name="id" value={member.id} />
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-heading text-lg font-semibold">Edit member</h3>
              <button
                type="button"
                className="text-xs font-semibold text-muted-foreground underline"
                disabled={updatePending}
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>

            {updateState.error ? (
              <p className="text-sm text-destructive" role="alert">
                {updateState.error}
              </p>
            ) : null}
            {deleteState.error ? (
              <p className="text-sm text-destructive" role="alert">
                {deleteState.error}
              </p>
            ) : null}

            <label className="block space-y-1.5">
              <span className="text-xs font-medium">Full name *</span>
              <Input
                name="full_name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11 rounded-xl bg-white"
              />
            </label>

            <div className="space-y-1.5">
              <span className="text-xs font-medium">Date of birth *</span>
              <DobField
                name="date_of_birth"
                value={dateOfBirth}
                onChange={setDateOfBirth}
                minAge={0}
                maxAge={119}
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium">Gender *</span>
                <select
                  name="gender"
                  required
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm"
                >
                  <option value="">Select</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-medium">Category *</span>
                <select
                  name="category"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm"
                >
                  <option value="">Select</option>
                  {MEMBERSHIP_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {MEMBERSHIP_CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium">Occupation</span>
              <Input
                name="occupation"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="h-11 rounded-xl bg-white"
              />
            </label>

            {member.payment_status === "paid" ? (
              <p className="text-xs text-muted-foreground">
                This member is already paid — profile details can change, but
                payment status and membership ID stay the same.
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={updatePending}
              className={cn("h-11 rounded-xl bg-primary text-white")}
            >
              {updatePending ? (
                <span className="inline-flex items-center gap-2">
                  <ButtonSpinner />
                  Saving…
                </span>
              ) : (
                "Save changes"
              )}
            </Button>
          </FormLock>
        </form>
      )}

      {deleteState.error && !editing ? (
        <p className="text-xs text-destructive" role="alert">
          {deleteState.error}
        </p>
      ) : null}
    </div>
  );
}
