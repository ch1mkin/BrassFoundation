import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ReferralSharePanel } from "@/components/membership/referral-share-panel";
import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Referrals" };

export default async function MemberReferralsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/member/referrals");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const { data: me } = await supabase
    .from("membership_applications")
    .select("membership_id, payment_status, full_name")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const membershipId = me?.membership_id || null;
  const isActive = Boolean(membershipId) || me?.payment_status === "paid";

  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "https://brassfoundation.com"
  ).replace(/\/$/, "");
  const referralLink = membershipId
    ? `${appUrl}/membership?ref=${encodeURIComponent(membershipId)}`
    : null;

  let referrals: {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    membership_id: string | null;
    payment_status: string | null;
    status: string | null;
    created_at: string;
  }[] = [];

  if (membershipId) {
    const admin = createServiceClient();
    const { data } = await admin
      .from("membership_applications")
      .select(
        "id, full_name, email, phone, membership_id, payment_status, status, created_at",
      )
      .eq("referred_by_membership_id", membershipId)
      .order("created_at", { ascending: false })
      .limit(200);
    referrals = data || [];
  }

  const paidCount = referrals.filter(
    (r) => r.payment_status === "paid" || r.membership_id,
  ).length;

  const inviterName =
    me?.full_name || profile?.full_name || profile?.email || "A member";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
          Referrals
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track people who joined with your referral, copy your code, and share
          an invite message.
        </p>
      </div>

      {!isActive || !membershipId || !referralLink ? (
        <div className="glass-card rounded-2xl p-6 text-sm text-muted-foreground">
          Your referral tools unlock after membership is active with a
          Membership ID. Finish registration and payment on{" "}
          <a href="/membership" className="font-semibold text-primary underline">
            Become a Member
          </a>
          .
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Your code" value={membershipId} mono />
            <StatCard label="Total referrals" value={String(referrals.length)} />
            <StatCard label="Paid / active" value={String(paidCount)} />
          </div>

          <ReferralSharePanel
            membershipId={membershipId}
            referralLink={referralLink}
            inviterName={inviterName}
          />

          <section className="glass-card space-y-3 rounded-2xl p-6">
            <h2 className="font-heading text-lg font-semibold">
              People who joined with your referral
            </h2>
            <ul className="divide-y divide-border">
              {referrals.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {row.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {row.email || "—"}
                      {row.phone ? ` · ${row.phone}` : ""}
                      {row.membership_id ? ` · ${row.membership_id}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(row.created_at).toLocaleString("en-IN")} ·{" "}
                      {row.payment_status || row.status || "—"}
                    </p>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {row.payment_status === "paid" || row.membership_id
                      ? "Active"
                      : "Pending"}
                  </p>
                </li>
              ))}
              {!referrals.length ? (
                <li className="py-8 text-center text-sm text-muted-foreground">
                  No referrals yet. Share your code or invite message to get
                  started.
                </li>
              ) : null}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={
          mono
            ? "mt-2 break-all font-mono text-base font-semibold"
            : "mt-2 font-heading text-2xl font-semibold"
        }
      >
        {value}
      </p>
    </div>
  );
}
