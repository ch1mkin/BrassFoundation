import type { Metadata } from "next";
import Link from "next/link";
import { AdminMembersTable } from "@/components/admin/admin-members-table";
import { MembershipStatCards } from "@/components/admin/membership-stat-cards";
import { buttonVariants } from "@/components/ui/button";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  getMembershipStats,
  isPaidFamilyStatus,
  isUnpaidFamilyStatus,
} from "@/lib/membership/member-count";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Members",
};

async function loadAllApplications() {
  const pageSize = 1000;
  const rows: Array<{
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
  }> = [];

  let supabase;
  try {
    supabase = createServiceClient();
  } catch {
    supabase = await createClient();
  }

  for (let from = 0; from < 20_000; from += pageSize) {
    const { data, error } = await supabase
      .from("membership_applications")
      .select(
        "id, user_id, full_name, email, phone, membership_type, status, member_status, district, state, membership_id, payment_status, created_at",
      )
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < pageSize) break;
  }
  return rows;
}

export default async function AdminMembersPage() {
  const stats = await getMembershipStats();
  let errorMessage: string | null = null;
  let applications: Awaited<ReturnType<typeof loadAllApplications>> = [];

  try {
    applications = await loadAllApplications();
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Could not load members.";
  }

  let familyRows: Array<{
    parent_membership_id: string | null;
    parent_user_id: string | null;
    payment_status: string | null;
  }> = [];
  try {
    const admin = createServiceClient();
    const { data } = await admin
      .from("family_members")
      .select("parent_membership_id, parent_user_id, payment_status");
    familyRows = data || [];
  } catch {
    familyRows = [];
  }

  const familyByParent = new Map<string, { paid: number; unpaid: number }>();
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

  const rows = applications.map((row) => {
    const byId = row.membership_id
      ? familyByParent.get(row.membership_id)
      : null;
    const byUser = row.user_id ? familyByParent.get(row.user_id) : null;
    return {
      ...row,
      familyPaid: Math.max(byId?.paid || 0, byUser?.paid || 0),
      familyUnpaid: Math.max(byId?.unpaid || 0, byUser?.unpaid || 0),
    };
  });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Members</h1>
          <p className="mt-2 text-muted-foreground">
            Every membership application. Search and filter without leaving this
            page. Approve requests, issue IDs, and update leave status.
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

      {errorMessage ? (
        <p className="mt-8 glass-card rounded-2xl p-6 text-sm text-destructive">
          Could not load applications. ({errorMessage})
        </p>
      ) : (
        <AdminMembersTable rows={rows} />
      )}
    </>
  );
}
