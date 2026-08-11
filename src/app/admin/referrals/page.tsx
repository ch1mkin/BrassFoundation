import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { ReferralLeaderboardChart } from "@/components/membership/referral-leaderboard-chart";
import { ReferralReportFilters } from "@/components/membership/referral-report-filters";

export const metadata: Metadata = { title: "Admin · Referrals" };

export default async function AdminReferralsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    referrer?: string;
    from?: string;
    to?: string;
    gender?: string;
    age_min?: string;
    age_max?: string;
    mandates_only?: string;
  }>;
}) {
  const filters = await searchParams;
  const { q, referrer } = filters;
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

  const { data, error } = await query.limit(1000);
  let rows = data || [];

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

  if (filters.from) {
    const from = new Date(filters.from);
    rows = rows.filter((r) => new Date(r.created_at) >= from);
  }
  if (filters.to) {
    const to = new Date(filters.to);
    to.setHours(23, 59, 59, 999);
    rows = rows.filter((r) => new Date(r.created_at) <= to);
  }
  if (filters.gender) {
    rows = rows.filter(
      (r) =>
        (r.gender || "").toLowerCase() === filters.gender!.toLowerCase(),
    );
  }
  if (filters.age_min) {
    const min = Number(filters.age_min);
    rows = rows.filter((r) => typeof r.age === "number" && r.age >= min);
  }
  if (filters.age_max) {
    const max = Number(filters.age_max);
    rows = rows.filter((r) => typeof r.age === "number" && r.age <= max);
  }
  if (filters.mandates_only === "1") {
    rows = rows.filter((r) => r.user_id && mandateUsers.has(r.user_id));
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

  const genderBuckets = { Female: 0, Male: 0, Other: 0, Unknown: 0 };
  for (const row of rows) {
    const g = String(row.gender || "").trim();
    if (g === "Female") genderBuckets.Female += 1;
    else if (g === "Male") genderBuckets.Male += 1;
    else if (g === "Other") genderBuckets.Other += 1;
    else genderBuckets.Unknown += 1;
  }
  const genderMax = Math.max(1, ...Object.values(genderBuckets));

  const statusBuckets = { Member: 0, Contributed: 0, Pending: 0 };
  for (const row of rows) {
    if (row.user_id && mandateUsers.has(row.user_id)) statusBuckets.Contributed += 1;
    else if (row.payment_status === "paid" || row.membership_id)
      statusBuckets.Member += 1;
    else statusBuckets.Pending += 1;
  }
  const statusMax = Math.max(1, ...Object.values(statusBuckets));

  const exportParams = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v) exportParams.set(k, String(v));
  }
  const csvHref = `/api/admin/referrals/export?${exportParams.toString()}&format=csv`;
  const pdfHref = `/api/admin/referrals/export?${exportParams.toString()}&format=pdf`;

  const referrerIds = leaderboard.map((r) => r.id).slice(0, 50);
  const { data: referrerApps } = referrerIds.length
    ? await admin
        .from("membership_applications")
        .select("membership_id, full_name")
        .in("membership_id", referrerIds)
    : { data: [] as { membership_id: string; full_name: string }[] };
  const nameById = new Map(
    (referrerApps || []).map((r) => [r.membership_id, r.full_name]),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Referrals</h1>
          <p className="mt-2 text-muted-foreground">
            Leaderboard, charts, filters, and CSV/PDF report downloads for
            referral registrations and mandates.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={csvHref}
            className="inline-flex h-11 items-center rounded-xl border border-border bg-white px-5 text-sm font-semibold text-foreground"
          >
            Download CSV
          </a>
          <a
            href={pdfHref}
            className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-white"
          >
            Download PDF
          </a>
        </div>
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
          Apply search
        </button>
      </form>

      <section className="glass-card space-y-4 rounded-2xl p-6">
        <h2 className="font-heading text-lg font-semibold">Report filters</h2>
        <ReferralReportFilters filters={filters} />
      </section>

      {error ? (
        <p className="text-sm text-destructive">
          Run migration 20260808200000… ({error.message})
        </p>
      ) : null}

      <ReferralLeaderboardChart
        title="Referral leaderboard (charts)"
        description="Top referrers in the current filter set."
        items={leaderboard.slice(0, 15).map((row) => ({
          id: row.id,
          label: nameById.get(row.id) || row.id,
          subtitle: row.id,
          registrations: row.registrations,
          mandates: row.mandates,
        }))}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <MiniChart
          title="By gender"
          rows={Object.entries(genderBuckets).map(([label, value]) => ({
            label,
            value,
            max: genderMax,
            tone: "bg-primary",
          }))}
        />
        <MiniChart
          title="By status"
          rows={[
            {
              label: "Contributed",
              value: statusBuckets.Contributed,
              max: statusMax,
              tone: "bg-secondary",
            },
            {
              label: "Member",
              value: statusBuckets.Member,
              max: statusMax,
              tone: "bg-primary",
            },
            {
              label: "Pending",
              value: statusBuckets.Pending,
              max: statusMax,
              tone: "bg-muted-foreground/50",
            },
          ]}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {leaderboard.slice(0, 9).map((row, index) => (
          <Link
            key={row.id}
            href={`/admin/referrals?referrer=${encodeURIComponent(row.id)}`}
            className="glass-card rounded-2xl p-4 transition hover:ring-1 hover:ring-primary/40"
          >
            <p className="text-xs text-muted-foreground">#{index + 1} Referrer</p>
            <p className="truncate text-sm font-semibold">
              {nameById.get(row.id) || row.id}
            </p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {row.id}
            </p>
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
                  No referral registrations match these filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MiniChart({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: number; max: number; tone: string }[];
}) {
  return (
    <section className="glass-card space-y-4 rounded-2xl p-6">
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium">{row.label}</span>
              <span className="tabular-nums font-semibold">{row.value}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted/60">
              <div
                className={`h-full rounded-full ${row.tone}`}
                style={{
                  width: `${Math.max(2, Math.round((row.value / row.max) * 100))}%`,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
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
