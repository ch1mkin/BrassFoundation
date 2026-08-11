import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ReferralSharePanel } from "@/components/membership/referral-share-panel";
import { ReferralLeaderboardChart } from "@/components/membership/referral-leaderboard-chart";
import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Referrals" };

type ReferralRow = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  membership_id: string | null;
  payment_status: string | null;
  status: string | null;
  gender: string | null;
  age: number | null;
  user_id: string | null;
  created_at: string;
  has_mandate: boolean;
};

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

  let referrals: ReferralRow[] = [];
  let leaderboard: {
    membership_id: string;
    full_name: string;
    registrations: number;
    mandates: number;
  }[] = [];

  if (membershipId) {
    const admin = createServiceClient();
    const { data } = await admin
      .from("membership_applications")
      .select(
        "id, full_name, email, phone, membership_id, payment_status, status, gender, age, user_id, created_at",
      )
      .eq("referred_by_membership_id", membershipId)
      .order("created_at", { ascending: false })
      .limit(500);

    const rows = data || [];
    const userIds = rows
      .map((r) => r.user_id)
      .filter((id): id is string => Boolean(id));

    const mandateUserIds = new Set<string>();
    if (userIds.length) {
      const { data: mandates } = await admin
        .from("payment_mandates")
        .select("user_id, status")
        .in("user_id", userIds);
      for (const m of mandates || []) {
        if (
          m.user_id &&
          ["authenticated", "active", "completed"].includes(
            String(m.status || "").toLowerCase(),
          )
        ) {
          mandateUserIds.add(m.user_id);
        }
      }
    }

    referrals = rows.map((row) => ({
      ...row,
      has_mandate: Boolean(row.user_id && mandateUserIds.has(row.user_id)),
    }));

    const { data: allReferred } = await admin
      .from("membership_applications")
      .select("referred_by_membership_id, user_id, full_name")
      .not("referred_by_membership_id", "is", null)
      .limit(5000);

    const refMap = new Map<
      string,
      { registrations: number; userIds: Set<string> }
    >();
    for (const row of allReferred || []) {
      const key = row.referred_by_membership_id as string;
      if (!refMap.has(key)) {
        refMap.set(key, { registrations: 0, userIds: new Set() });
      }
      const entry = refMap.get(key)!;
      entry.registrations += 1;
      if (row.user_id) entry.userIds.add(row.user_id);
    }

    const allMandateUsers = new Set<string>();
    const allUids = [...refMap.values()].flatMap((v) => [...v.userIds]);
    if (allUids.length) {
      const { data: mandates } = await admin
        .from("payment_mandates")
        .select("user_id, status")
        .in("user_id", allUids.slice(0, 2000));
      for (const m of mandates || []) {
        if (
          m.user_id &&
          ["authenticated", "active", "completed"].includes(
            String(m.status || "").toLowerCase(),
          )
        ) {
          allMandateUsers.add(m.user_id);
        }
      }
    }

    const referrerIds = [...refMap.keys()].slice(0, 100);
    const { data: referrerApps } = await admin
      .from("membership_applications")
      .select("membership_id, full_name")
      .in("membership_id", referrerIds);

    const nameById = new Map(
      (referrerApps || []).map((r) => [r.membership_id as string, r.full_name]),
    );

    leaderboard = [...refMap.entries()]
      .map(([id, stats]) => ({
        membership_id: id,
        full_name: nameById.get(id) || id,
        registrations: stats.registrations,
        mandates: [...stats.userIds].filter((uid) =>
          allMandateUsers.has(uid),
        ).length,
      }))
      .sort(
        (a, b) =>
          b.registrations + b.mandates * 2 - (a.registrations + a.mandates * 2),
      )
      .slice(0, 12);
  }

  const paidCount = referrals.filter(
    (r) => r.payment_status === "paid" || r.membership_id,
  ).length;
  const mandateCount = referrals.filter((r) => r.has_mandate).length;
  const inviterName =
    me?.full_name || profile?.full_name || profile?.email || "A member";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
          Referrals
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Share your link, see who joined, and check the leaderboard. Report
          downloads are available to admins only.
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
          <div className="grid gap-3 sm:grid-cols-4">
            <StatCard label="Your code" value={membershipId} mono />
            <StatCard label="Total referrals" value={String(referrals.length)} />
            <StatCard label="Members" value={String(paidCount)} />
            <StatCard label="Contributed" value={String(mandateCount)} />
          </div>

          <ReferralSharePanel
            membershipId={membershipId}
            referralLink={referralLink}
            inviterName={inviterName}
          />

          <ReferralLeaderboardChart
            description="Top referrers by registrations and monthly mandates."
            items={leaderboard.map((row) => ({
              id: row.membership_id,
              label:
                row.membership_id === membershipId
                  ? `${row.full_name} (You)`
                  : row.full_name,
              subtitle: row.membership_id,
              registrations: row.registrations,
              mandates: row.mandates,
              highlight: row.membership_id === membershipId,
            }))}
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
                      {typeof row.age === "number" ? ` · Age ${row.age}` : ""}
                      {row.gender ? ` · ${row.gender}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(row.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {row.has_mandate
                      ? "Contributed"
                      : row.payment_status === "paid" || row.membership_id
                        ? "Member"
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
