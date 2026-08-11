"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SelfieField } from "@/components/membership/selfie-field";
import { DobField } from "@/components/membership/dob-field";
import { MEMBERSHIP_CATEGORIES } from "@/lib/membership/categories";
import {
  updateMemberProfileAction,
  type UpdateProfileState,
} from "@/lib/membership/update-profile-action";

export function MemberProfileForm({
  defaults,
}: {
  defaults: {
    firstName: string;
    surname: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    gender: string;
    category: string;
    avatarUrl?: string | null;
  };
}) {
  const [state, action, isPending] = useActionState(
    updateMemberProfileAction,
    {} as UpdateProfileState,
  );
  const [firstName, setFirstName] = useState(defaults.firstName);
  const [surname, setSurname] = useState(defaults.surname);
  const [phone, setPhone] = useState(defaults.phone);
  const [address, setAddress] = useState(defaults.address);
  const [dateOfBirth, setDateOfBirth] = useState(defaults.dateOfBirth);
  const [gender, setGender] = useState(defaults.gender);
  const [category, setCategory] = useState(defaults.category);

  useEffect(() => {
    if (state.success || state.error) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state.success, state.error]);

  return (
    <form action={action} className="glass-card space-y-6 rounded-2xl p-6 sm:p-8">
      {state.error ? (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-xl bg-success/10 px-4 py-3 text-sm text-success">
          {state.success}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium">First name *</span>
          <Input
            name="first_name"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="h-11 rounded-xl bg-white"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Surname *</span>
          <Input
            name="surname"
            required
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            className="h-11 rounded-xl bg-white"
          />
        </label>
        <label className="block space-y-2 sm:col-span-2">
          <span className="text-sm font-medium">Email</span>
          <Input
            value={defaults.email}
            readOnly
            className="h-11 rounded-xl bg-muted/40"
          />
          <span className="text-xs text-muted-foreground">
            Email cannot be changed here. Contact support if needed.
          </span>
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Phone *</span>
          <Input
            name="phone"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-11 rounded-xl bg-white"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Gender *</span>
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
        <label className="block space-y-2 sm:col-span-2">
          <span className="text-sm font-medium">Address *</span>
          <textarea
            name="address"
            required
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm"
          />
        </label>
        <div className="space-y-2 sm:col-span-2">
          <span className="text-sm font-medium">Date of birth *</span>
          <DobField
            name="date_of_birth"
            value={dateOfBirth}
            onChange={setDateOfBirth}
            minAge={1}
            maxAge={119}
            required
          />
        </div>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Category *</span>
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
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Profile photo</p>
        {defaults.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={defaults.avatarUrl}
            alt=""
            className="mb-3 size-20 rounded-full object-cover ring-2 ring-border"
          />
        ) : null}
        <SelfieField required={false} />
        <p className="text-xs text-muted-foreground">
          Leave blank to keep your current photo. Capture or upload a new one to
          replace it.
        </p>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-11 rounded-xl bg-primary px-8 text-white"
      >
        {isPending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
