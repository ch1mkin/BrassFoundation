import type { Metadata } from "next";
import { MembershipStatCards } from "@/components/admin/membership-stat-cards";
import { createClient } from "@/lib/supabase/server";
import {
  getMembershipStats,
  isPaidFamilyStatus,
  isUnpaidFamilyStatus,
} from "@/lib/membership/member-count";

export const metadata: Metadata = { title: "Admin · Family members" };

export default async function AdminFamilyMembersPage() {
  const supabase = await createClient();
  const stats = await getMembershipStats();
  const { data, error } = await supabase
    .from("family_members")
    .select(
      "id, full_name, age, gender, category, payment_status, parent_membership_id, membership_id, fee_paise, created_at, parent_user_id",
    )
    .order("created_at", { ascending: false })
    .limit(300);

  const rows = data || [];
  const grouped = new Map<string, typeof rows>();
  for (const row of rows) {
    const key = row.parent_membership_id || row.parent_user_id;
    const list = grouped.get(key) || [];
    list.push(row);
    grouped.set(key, list);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Family members</h1>
        <p className="mt-2 text-muted-foreground">
          Parents and relatives added by existing members. Under-18 are fee
          waived. Paid family members are included in the public membership
          total.
        </p>
      </div>

      <MembershipStatCards {...stats} />

      {error ? (
        <p className="text-sm text-destructive">
          Run migration 20260808200000… ({error.message})
        </p>
      ) : null}

      <div className="space-y-6">
        {[...grouped.entries()].map(([parent, members]) => {
          const paid = members.filter((m) =>
            isPaidFamilyStatus(m.payment_status),
          ).length;
          const unpaid = members.filter((m) =>
            isUnpaidFamilyStatus(m.payment_status),
          ).length;
          return (
            <section key={parent} className="glass-card rounded-2xl p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-heading text-lg font-semibold">
                  Parent membership:{" "}
                  <span className="font-mono text-base">{parent}</span>
                </h2>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-success">{paid} paid</span>
                  {" · "}
                  <span className="font-semibold text-amber-700">
                    {unpaid} unpaid
                  </span>
                </p>
              </div>
              <div className="mt-4 space-y-2">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-low px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">{m.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Age {m.age} · {m.gender} · {m.category}
                        {m.membership_id ? ` · ${m.membership_id}` : ""}
                      </p>
                    </div>
                    <span
                      className={
                        isPaidFamilyStatus(m.payment_status)
                          ? "text-xs font-semibold uppercase text-success"
                          : "text-xs font-semibold uppercase text-amber-700"
                      }
                    >
                      {m.payment_status}
                      {m.fee_paise ? ` · ₹${m.fee_paise / 100}` : " · free"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
        {!rows.length ? (
          <p className="text-sm text-muted-foreground">No family members yet.</p>
        ) : null}
      </div>
    </div>
  );
}
