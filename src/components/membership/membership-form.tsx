"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { Input } from "@/components/ui/input";
import {
  submitMembershipApplicationAction,
  type MembershipActionState,
} from "@/lib/membership/actions";
import {
  membershipTypeLabels,
  membershipTypes,
} from "@/lib/membership/schema";

const initial: MembershipActionState = {};

function Field({
  label,
  name,
  required,
  type = "text",
  placeholder,
  multiline,
  children,
}: {
  label: string;
  name?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  multiline?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="ml-1 text-sm font-medium text-muted-foreground">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </span>
      {children ??
        (multiline ? (
          <textarea
            name={name}
            required={required}
            placeholder={placeholder}
            rows={4}
            className="w-full rounded-xl border border-input bg-white px-3 py-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        ) : (
          <Input
            name={name}
            type={type}
            required={required}
            placeholder={placeholder}
            className="h-11 rounded-xl bg-white"
          />
        ))}
    </label>
  );
}

export function MembershipForm() {
  const [state, action, pending] = useActionState(
    submitMembershipApplicationAction,
    initial,
  );

  if (state.success) {
    return (
      <div className="glass-card rounded-2xl p-8">
        <p className="font-heading text-2xl font-semibold text-primary">
          Application received
        </p>
        <p className="mt-3 text-muted-foreground">{state.success}</p>
        {state.applicationId && (
          <p className="mt-4 text-xs text-muted-foreground">
            Reference: {state.applicationId}
          </p>
        )}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6">
      <FormLock pending={pending} className="space-y-6">
      <section className="glass-card space-y-4 rounded-2xl p-6 sm:p-8">
        <h2 className="font-heading text-xl font-semibold">Personal details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" name="full_name" required />
          <Field label="Email" name="email" type="email" required />
          <Field label="Phone" name="phone" type="tel" required />
          <Field label="Date of birth" name="date_of_birth" type="date" />
          <Field label="Gender" name="gender" placeholder="Optional" />
          <Field label="Education" name="education" required />
          <Field label="Occupation" name="occupation" required />
          <Field label="District" name="district" required />
          <Field label="State" name="state" required />
        </div>
        <Field
          label="Address"
          name="address"
          multiline
          placeholder="Street, city, PIN"
        />
      </section>

      <section className="glass-card space-y-4 rounded-2xl p-6 sm:p-8">
        <h2 className="font-heading text-xl font-semibold">Membership</h2>
        <Field label="Membership type" required>
          <select
            name="membership_type"
            defaultValue="general"
            className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {membershipTypes.map((type) => (
              <option key={type} value={type}>
                {membershipTypeLabels[type]}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Interests"
          name="interests"
          placeholder="Education, volunteering, legal awareness (comma-separated)"
        />
        <Field
          label="Reason for joining"
          name="reason_for_joining"
          required
          multiline
          placeholder="Tell us why you want to join Brass Foundation"
        />
      </section>

      {state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="h-12 rounded-xl bg-primary px-8 shadow-lg shadow-primary/20"
      >
        {pending ? "Submitting…" : "Submit application"}
        <span className="material-symbols-outlined text-[18px]">person_add</span>
      </Button>
      </FormLock>
    </form>
  );
}
