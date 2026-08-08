import type { Metadata } from "next";
import { FamilyMembersForm } from "@/components/membership/family-members-form";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Family members" };

export default async function MemberFamilyPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/member/family");

  const supabase = await createClient();
  const { data: family } = await supabase
    .from("family_members")
    .select(
      "id, full_name, age, gender, occupation, category, payment_status, membership_id, fee_paise, created_at",
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

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Family members</h1>
        <p className="mt-2 text-muted-foreground">
          Add relatives to your membership. Members under 18 are free; each
          adult is ₹10.
        </p>
      </div>

      {referralLink ? (
        <div className="glass-card rounded-2xl p-5 text-sm">
          <p className="font-medium">Your referral link</p>
          <p className="mt-1 break-all text-muted-foreground">{referralLink}</p>
        </div>
      ) : null}

      <FamilyMembersForm />

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold">Your family list</h2>
        {(family || []).map((row) => (
          <div key={row.id} className="glass-card rounded-2xl p-4 text-sm">
            <p className="font-medium">{row.full_name}</p>
            <p className="text-muted-foreground">
              Age {row.age} · {row.gender} · {row.category} ·{" "}
              {row.payment_status}
              {row.membership_id ? ` · ${row.membership_id}` : ""}
            </p>
          </div>
        ))}
        {!family?.length ? (
          <p className="text-sm text-muted-foreground">No family members yet.</p>
        ) : null}
      </section>
    </div>
  );
}
