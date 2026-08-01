import type { Metadata } from "next";
import { BrandLogo } from "@/components/brand/logo";
import { MembershipForm } from "@/components/membership/membership-form";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Membership",
};

export default function MembershipPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-28 pb-20 sm:px-6 lg:px-20">
      <div className="mb-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
        <BrandLogo size="lg" href={null} />
        <div>
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">
            Membership
          </p>
          <h1 className="font-heading mt-2 text-3xl font-semibold sm:text-4xl">
            Become a Member
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Join {SITE.name} — {SITE.slogan}. Submit your application for
            review. Digital membership cards are issued after approval.
          </p>
        </div>
      </div>
      <MembershipForm />
    </div>
  );
}
