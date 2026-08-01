import type { Metadata } from "next";
import { BrandLogo } from "@/components/brand/logo";
import { MembershipForm } from "@/components/membership/membership-form";

export const metadata: Metadata = {
  title: "Membership",
};

export default function MembershipPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-28 pb-24 lg:px-8">
      <div className="mb-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
        <BrandLogo size="lg" href={null} />
        <div>
          <p className="font-heading text-sm font-medium tracking-[0.18em] text-brand uppercase">
            Membership
          </p>
          <h1 className="mt-2 font-heading text-4xl font-medium">
            Become a Member
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Join Brass Foundation — Education to Prosperity. Submit your
            application for review. Digital membership cards are issued after
            approval.
          </p>
        </div>
      </div>
      <MembershipForm />
    </div>
  );
}
