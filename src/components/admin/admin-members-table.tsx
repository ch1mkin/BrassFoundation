"use client";

import { useMemo, useState } from "react";
import { MemberStatusForm } from "@/components/membership/member-status-form";
import { MembershipReviewActions } from "@/components/membership/review-actions";
import { MembershipQr } from "@/components/membership/membership-qr";
import { membershipTypeLabels } from "@/lib/membership/schema";

export type AdminMemberRow = {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  membership_type: string;
  status: string;
  member_status: string | null;
  district: string | null;
  state: string | null;
  membership_id: string | null;
  payment_status: string | null;
  created_at: string;
  familyPaid: number;
  familyUnpaid: number;
};

const STATUS_OPTIONS = ["all", "pending", "approved", "rejected"] as const;
const PAYMENT_OPTIONS = ["all", "paid", "unpaid", "pending", "waived"] as const;
const MEMBER_OPTIONS = ["all", "active", "inactive", "suspended", "left"] as const;
const TYPE_OPTIONS = [
  "all",
  "volunteer",
  "student",
  "general",
  "life_member",
] as const;

function matches(
  row: AdminMemberRow,
  q: string,
  status: string,
  payment: string,
  member: string,
  type: string,
) {
  if (status !== "all" && row.status !== status) return false;
  if (payment !== "all" && (row.payment_status || "") !== payment) return false;
  if (member !== "all" && (row.member_status || "active") !== member) return false;
  if (type !== "all" && row.membership_type !== type) return false;
  if (!q) return true;
  const hay = [
    row.full_name,
    row.email,
    row.phone,
    row.membership_id,
    row.district,
    row.state,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

export function AdminMembersTable({ rows }: { rows: AdminMemberRow[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [payment, setPayment] = useState<string>("all");
  const [member, setMember] = useState<string>("all");
  const [type, setType] = useState<string>("all");

  const query = q.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      rows.filter((row) => matches(row, query, status, payment, member, type)),
    [rows, query, status, payment, member, type],
  );

  const showQr = filtered.length <= 40;

  return (
    <div className="mt-6 space-y-4">
      <div className="glass-card grid gap-3 rounded-2xl p-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="sm:col-span-2 lg:col-span-1">
          <span className="mb-1 block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Search
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, email, phone, ID, district…"
            className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm"
          />
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Application
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt === "all" ? "All statuses" : opt}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Payment
          </span>
          <select
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm"
          >
            {PAYMENT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt === "all" ? "All payments" : opt}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Member
          </span>
          <select
            value={member}
            onChange={(e) => setMember(e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm"
          >
            {MEMBER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt === "all" ? "All members" : opt}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Type
          </span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt === "all"
                  ? "All types"
                  : membershipTypeLabels[
                      opt as keyof typeof membershipTypeLabels
                    ] || opt}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
        of {rows.length} members
        {showQr ? "" : " · QR codes hidden until you narrow the list"}
      </p>

      {!filtered.length ? (
        <p className="glass-card rounded-2xl p-6 text-muted-foreground">
          No members match these filters.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-soft">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">ID / QR</th>
                <th className="px-4 py-3 font-medium">Family</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border/70 last:border-0"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{row.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.phone || row.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[row.district, row.state].filter(Boolean).join(", ")}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {membershipTypeLabels[
                      row.membership_type as keyof typeof membershipTypeLabels
                    ] ?? row.membership_type}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs">
                      {row.membership_id || "—"}
                    </p>
                    {showQr && row.membership_id ? (
                      <div className="mt-2 inline-block rounded-lg bg-white p-1">
                        <MembershipQr
                          membershipId={row.membership_id}
                          size={72}
                        />
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {row.familyPaid === 0 && row.familyUnpaid === 0 ? (
                      <span className="text-muted-foreground">None</span>
                    ) : (
                      <div className="space-y-1">
                        <p>
                          <span className="font-semibold text-success">
                            {row.familyPaid} paid
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold text-amber-700">
                            {row.familyUnpaid} unpaid
                          </span>
                        </p>
                        <a
                          href="/admin/family-members"
                          className="text-primary underline"
                        >
                          View
                        </a>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs capitalize">{row.status}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      Pay: {row.payment_status || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      Member: {row.member_status || "active"}
                    </p>
                    {row.status === "approved" || row.membership_id ? (
                      <MemberStatusForm
                        applicationId={row.id}
                        currentStatus={row.member_status}
                      />
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <MembershipReviewActions
                      applicationId={row.id}
                      status={row.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
