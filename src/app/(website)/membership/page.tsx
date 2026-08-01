import type { Metadata } from "next";
import { BrandLogo } from "@/components/brand/logo";
import { MembershipRegistrationForm } from "@/components/membership/membership-registration-form";
import { ContributionSection } from "@/components/membership/contribution-section";
import { SITE } from "@/lib/constants";
import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Membership",
};

export default async function MembershipPage() {
  const user = await getSessionUser();
  let alreadyMember = false;
  let profile: { full_name: string | null; email: string | null; phone?: string | null } | null =
    null;

  if (user) {
    const supabase = await createClient();
    const { data: app } = await supabase
      .from("membership_applications")
      .select("status, payment_status, membership_id")
      .eq("user_id", user.id)
      .eq("status", "approved")
      .eq("payment_status", "paid")
      .maybeSingle();
    alreadyMember = Boolean(app);

    const { data: p } = await supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", user.id)
      .maybeSingle();
    profile = p;
  }

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
            Join {SITE.name} — register with your details, sign consent, pay ₹10,
            and become a member instantly. There are no guest accounts.
          </p>
        </div>
      </div>

      {alreadyMember ? (
        <div className="space-y-8">
          <div className="glass-card rounded-2xl p-6 text-sm text-success">
            You are already an active member. Thank you for being part of{" "}
            {SITE.name}.
          </div>
          <ContributionSection
            defaultName={profile?.full_name || undefined}
            defaultEmail={profile?.email || undefined}
            defaultPhone={profile?.phone || undefined}
          />
        </div>
      ) : (
        <div id="register" className="scroll-mt-28">
          <MembershipRegistrationForm />
        </div>
      )}
    </div>
  );
}
