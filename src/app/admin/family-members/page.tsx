import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin · Family members" };

export default async function AdminFamilyMembersPage() {
  const supabase = await createClient();
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
          waived.
        </p>
      </div>
      {error ? (
        <p className="text-sm text-destructive">
          Run migration 20260808200000… ({error.message})
        </p>
      ) : null}

      <div className="space-y-6">
        {[...grouped.entries()].map(([parent, members]) => (
          <section key={parent} className="glass-card rounded-2xl p-5">
            <h2 className="font-heading text-lg font-semibold">
              Parent membership:{" "}
              <span className="font-mono text-base">{parent}</span>
            </h2>
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
                  <span className="text-xs font-semibold uppercase">
                    {m.payment_status}
                    {m.fee_paise ? ` · ₹${m.fee_paise / 100}` : " · free"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
        {!rows.length ? (
          <p className="text-sm text-muted-foreground">No family members yet.</p>
        ) : null}
      </div>
    </div>
  );
}
