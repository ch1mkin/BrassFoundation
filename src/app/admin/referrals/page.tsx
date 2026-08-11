import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Admin · Referrals" };

export default async function AdminReferralsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; referrer?: string }>;
}) {
  const { q, referrer } = await searchParams;
  const supabase = await createClient();
  const admin = createServiceClient();

  let query = supabase
    .from("membership_applications")
    .select(
      "id, full_name, email, phone, membership_id, referred_by_membership_id, payment_status, approved_at, created_at, user_id, gender, age",
    )
    .not("referred_by_membership_id", "is", null)
    .order("created_at", { ascending: false });

  if (referrer?.trim()) {
    query = query.eq(
      "referred_by_membership_id",
      referrer.trim().toUpperCase(),
    );
  }
  if (q?.trim()) {
    const term = `%${q.trim()}%`;
    query = query.or(
      `full_name.ilike.${term},email.ilike.${term},membership_id.ilike.${term}`,
    );
  }

  const { data, error } = await query.limit(500);
  const rows = data || [];

  const userIds = rows
    .map((r) => r.user_id)
    .filter((id): id is string => Boolean(id));
  const mandateUsers = new Set<string>();
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
        mandateUsers.add(m.user_id);
      }
    }
  }

  const byReferrer = new Map<
    string,
    { registrations: number; mandates: number }
  >();
  for (const row of rows) {
    const key = row.referred_by_membership_id || "—";
    if (!byReferrer.has(key)) {
      byReferrer.set(key, { registrations: 0, mandates: 0 });
    }
    const entry = byReferrer.get(key)!;
    entry.registrations += 1;
    if (row.user_id && mandateUsers.has(row.user_id)) {
      entry.mandates += 1;
    }
  }

  const leaderboard = [...byReferrer.entries()]
    .map(([id, stats]) => ({ id, ...stats }))
    .sort(
      (a, b) =>
        b.registrations + b.mandates * 2 - (a.registrations + a.mandates * 2),
    );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Referrals</h1>
        <p className="mt-2 text-muted-foreground">
          Leaderboard of referrers by registrations and mandates from referral
          links (`/membership?ref=BF-YYYY-XXXXXX`).
        </p>
      </div>

      <form className="glass-card grid gap-3 rounded-2xl p-4 sm:grid-cols-3">
        <InputLike
          name="referrer"
          placeholder="Filter by referrer ID"
          defaultValue={referrer || ""}
        />
        <InputLike
          name="q"
          placeholder="Search name / email / ID"
          defaultValue={q || ""}
        />
        <button
          type="submit"
          className="h-11 rounded-xl bg-primary text-sm font-semibold text-white"
        >
          Apply filters
        </button>
      </form>

      {error ? (
        <p className="text-sm text-destructive">
          Run migration 20260808200000… ({error.message})
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {leaderboard.map((row, index) => (
          <Link
            key={row.id}
            href={`/admin/referrals?referrer=${encodeURIComponent(row.id)}`}
            className="glass-card rounded-2xl p-4 transition hover:ring-1 hover:ring-primary/40"
          >
            <p className="text-xs text-muted-foreground">
              #{index + 1} Referrer
            </p>
            <p className="font-mono text-sm font-semibold">{row.id}</p>
            <p className="mt-2 font-heading text-2xl font-semibold text-primary">
              {row.registrations}
            </p>
            <p className="text-xs text-muted-foreground">
              registrations · {row.mandates} mandates
            </p>
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface-low text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Membership ID</th>
              <th className="px-4 py-3">Referred by</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-border/70">
                <td className="px-4 py-3">
                  <p className="font-medium">{row.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.email}
                    {typeof row.age === "number" ? ` · Age ${row.age}` : ""}
                    {row.gender ? ` · ${row.gender}` : ""}
                  </p>
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {row.membership_id || "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {row.referred_by_membership_id}
                </td>
                <td className="px-4 py-3">
                  {row.user_id && mandateUsers.has(row.user_id)
                    ? "Contributed"
                    : row.payment_status === "paid" || row.membership_id
                      ? "Member"
                      : row.payment_status || "Pending"}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(
                    row.approved_at || row.created_at,
                  ).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No referral registrations yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InputLike({
  name,
  placeholder,
  defaultValue,
}: {
  name: string;
  placeholder: string;
  defaultValue: string;
}) {
  return (
    <input
      name={name}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="h-11 rounded-xl border border-input bg-white px-3 text-sm"
    />
  );
}
