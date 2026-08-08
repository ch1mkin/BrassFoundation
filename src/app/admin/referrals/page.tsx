import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin · Referrals" };

export default async function AdminReferralsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; referrer?: string }>;
}) {
  const { q, referrer } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("membership_applications")
    .select(
      "id, full_name, email, phone, membership_id, referred_by_membership_id, payment_status, approved_at, created_at",
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

  const { data, error } = await query.limit(200);
  const rows = data || [];

  const byReferrer = new Map<string, number>();
  for (const row of rows) {
    const key = row.referred_by_membership_id || "—";
    byReferrer.set(key, (byReferrer.get(key) || 0) + 1);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Referrals</h1>
        <p className="mt-2 text-muted-foreground">
          Track members who joined through another member&apos;s referral link
          (`/membership?ref=BF-YYYY-XXXXXX`).
        </p>
      </div>

      <form className="glass-card grid gap-3 rounded-2xl p-4 sm:grid-cols-3">
        <InputLike name="referrer" placeholder="Filter by referrer ID" defaultValue={referrer || ""} />
        <InputLike name="q" placeholder="Search name / email / ID" defaultValue={q || ""} />
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
        {[...byReferrer.entries()].map(([id, count]) => (
          <Link
            key={id}
            href={`/admin/referrals?referrer=${encodeURIComponent(id)}`}
            className="glass-card rounded-2xl p-4 transition hover:ring-1 hover:ring-primary/40"
          >
            <p className="text-xs text-muted-foreground">Referrer</p>
            <p className="font-mono text-sm font-semibold">{id}</p>
            <p className="mt-2 text-2xl font-heading font-semibold text-primary">
              {count}
            </p>
            <p className="text-xs text-muted-foreground">referred joins (filtered)</p>
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
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-border/70">
                <td className="px-4 py-3">
                  <p className="font-medium">{row.full_name}</p>
                  <p className="text-xs text-muted-foreground">{row.email}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {row.membership_id || "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {row.referred_by_membership_id}
                </td>
                <td className="px-4 py-3">{row.payment_status}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(row.approved_at || row.created_at).toLocaleDateString(
                    "en-IN",
                  )}
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
