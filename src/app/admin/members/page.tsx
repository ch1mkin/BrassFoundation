import type { Metadata } from "next";
import Link from "next/link";
import { MembershipStatCards } from "@/components/admin/membership-stat-cards";
import { MemberStatusForm } from "@/components/membership/member-status-form";
import { MembershipReviewActions } from "@/components/membership/review-actions";
import { MembershipQr } from "@/components/membership/membership-qr";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  getMembershipStats,
  isPaidFamilyStatus,
  isUnpaidFamilyStatus,
} from "@/lib/membership/member-count";
import { membershipTypeLabels } from "@/lib/membership/schema";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Membership Requests",
};

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const stats = await getMembershipStats();

  let query = supabase
    .from("membership_applications")
    .select(
      "id, user_id, full_name, email, phone, membership_type, status, member_status, district, state, membership_id, payment_status, created_at",
    )
    .order("created_at", { ascending: false });

  const term = q?.trim();
  if (term) {
    const pattern = `%${term}%`;
    query = query.or(
      `full_name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern},membership_id.ilike.${pattern},district.ilike.${pattern},state.ilike.${pattern}`,
    );
  }

  const { data, error } = await query.limit(term ? 200 : 100);

  // Family paid/unpaid counts keyed by parent membership ID and parent user ID
  const admin = createServiceClient();
  const { data: familyRows } = await admin
    .from("family_members")
    .select("parent_membership_id, parent_user_id, payment_status");

  const familyByParent = new Map<
    string,
    { paid: number; unpaid: number }
  >();
  for (const row of familyRows || []) {
    const keys = [row.parent_membership_id, row.parent_user_id].filter(
      Boolean,
    ) as string[];
    for (const key of keys) {
      const cur = familyByParent.get(key) || { paid: 0, unpaid: 0 };
      if (isPaidFamilyStatus(row.payment_status)) cur.paid += 1;
      else if (isUnpaidFamilyStatus(row.payment_status)) cur.unpaid += 1;
      familyByParent.set(key, cur);
    }
  }

  function familyFor(row: {
    membership_id: string | null;
    user_id: string | null;
  }) {
    const byId = row.membership_id
      ? familyByParent.get(row.membership_id)
      : null;
    const byUser = row.user_id ? familyByParent.get(row.user_id) : null;
    return {
      paid: Math.max(byId?.paid || 0, byUser?.paid || 0),
      unpaid: Math.max(byId?.unpaid || 0, byUser?.unpaid || 0),
    };
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold">
            Membership Requests
          </h1>
          <p className="mt-2 text-muted-foreground">
            Approve members, issue QR membership IDs, and update leave status.
            Totals match the public live membership counter.
          </p>
        </div>
        <Link
          href="/membership"
          className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}
        >
          View public form
        </Link>
      </div>

      <div className="mt-6">
        <MembershipStatCards {...stats} />
      </div>

      <form className="glass-card mt-6 flex flex-wrap gap-3 rounded-2xl p-4">
        <input
          name="q"
          defaultValue={term || ""}
          placeholder="Search name, email, phone, membership ID…"
          className="h-11 min-w-[220px] flex-1 rounded-xl border border-input bg-white px-3 text-sm"
        />
        <button
          type="submit"
          className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-white"
        >
          Search
        </button>
        {term ? (
          <Link
            href="/admin/members"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-11 rounded-xl",
            )}
          >
            Clear
          </Link>
        ) : null}
      </form>

      {error ? (
        <p className="mt-8 glass-card rounded-2xl p-6 text-sm text-destructive">
          Could not load applications. ({error.message})
        </p>
      ) : !data?.length ? (
        <p className="mt-8 glass-card rounded-2xl p-6 text-muted-foreground">
          {term ? "No members matched your search." : "No applications yet."}
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl bg-white shadow-soft">
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
              {data.map((row) => {
                const family = familyFor(row);
                return (
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
                      {row.membership_id ? (
                        <div className="mt-2 inline-block rounded-lg bg-white p-1">
                          <MembershipQr
                            membershipId={row.membership_id}
                            size={72}
                          />
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {family.paid === 0 && family.unpaid === 0 ? (
                        <span className="text-muted-foreground">None</span>
                      ) : (
                        <div className="space-y-1">
                          <p>
                            <span className="font-semibold text-success">
                              {family.paid} paid
                            </span>
                          </p>
                          <p>
                            <span className="font-semibold text-amber-700">
                              {family.unpaid} unpaid
                            </span>
                          </p>
                          <Link
                            href="/admin/family-members"
                            className="text-primary underline"
                          >
                            View
                          </Link>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs capitalize">{row.status}</p>
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
