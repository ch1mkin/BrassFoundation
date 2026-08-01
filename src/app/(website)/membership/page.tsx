import type { Metadata } from "next";

export const metadata: Metadata = { title: "Membership" };

export default function MembershipPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-32 pb-24 lg:px-8">
      <p className="font-heading text-sm font-medium tracking-[0.18em] text-primary uppercase">
        Membership
      </p>
      <h1 className="mt-3 font-heading text-4xl font-semibold">
        Become a Member
      </h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Online registration, membership types, document upload, and digital card
        generation will live here.
      </p>
    </div>
  );
}
