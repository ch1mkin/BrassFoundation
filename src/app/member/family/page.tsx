import type { Metadata } from "next";
import { FamilyMembersForm } from "@/components/membership/family-members-form";
import { FamilyMemberCard } from "@/components/membership/family-member-card";
import { FamilyPayButton } from "@/components/membership/family-pay-button";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { formatInrFromPaise } from "@/lib/payments/constants";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Family members" };

function isPayableStatus(status: string | null | undefined) {
  return status === "unpaid" || status === "pending";
}

export default async function MemberFamilyPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/member/family");

  const supabase = await createClient();
  const { data: family } = await supabase
    .from("family_members")
    .select(
      "id, full_name, age, date_of_birth, gender, occupation, category, payment_status, membership_id, fee_paise, created_at",
    )
    .eq("parent_user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: me } = await supabase
    .from("membership_applications")
    .select("membership_id")
    .eq("user_id", user.id)
    .not("membership_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const referralLink = me?.membership_id
    ? `${appUrl}/membership?ref=${encodeURIComponent(me.membership_id)}`
    : null;

  const unpaid = (family || []).filter((row) =>
    isPayableStatus(row.payment_status),
  );
  const unpaidTotalPaise = unpaid.reduce(
    (sum, row) => sum + (row.fee_paise || 0),
    0,
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Family members</h1>
        <p className="mt-2 text-muted-foreground">
          Save relatives first — payment is optional until you&apos;re ready.
          Members under 18 are free; each adult is ₹10 and receives a membership
          ID after payment. You can edit or remove family members anytime.
        </p>
      </div>

      {referralLink ? (
        <div className="glass-card rounded-2xl p-5 text-sm">
          <p className="font-medium">Invite others with your referral</p>
          <p className="mt-1 text-muted-foreground">
            Copy your code, customize an invite message, and track who joined on{" "}
            <a
              href="/member/referrals"
              className="font-semibold text-primary underline"
            >
              Referrals
            </a>
            .
          </p>
        </div>
      ) : null}

      <FamilyMembersForm />

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-xl font-semibold">
            Your family list
          </h2>
          {unpaid.length > 0 && unpaidTotalPaise > 0 ? (
            <FamilyPayButton
              familyIds={unpaid.map((r) => r.id)}
              amountPaise={unpaidTotalPaise}
              label={`Pay all unpaid (${formatInrFromPaise(unpaidTotalPaise)})`}
              size="default"
            />
          ) : null}
        </div>

        {(family || []).map((row) => (
          <FamilyMemberCard
            key={row.id}
            member={{
              id: row.id,
              full_name: row.full_name,
              age: row.age,
              date_of_birth: row.date_of_birth,
              gender: row.gender,
              occupation: row.occupation,
              category: row.category,
              payment_status: row.payment_status,
              membership_id: row.membership_id,
              fee_paise: row.fee_paise,
            }}
          />
        ))}
        {!family?.length ? (
          <p className="text-sm text-muted-foreground">No family members yet.</p>
        ) : null}
      </section>
    </div>
  );
}
