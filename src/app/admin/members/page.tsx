import type { Metadata } from "next";
import Link from "next/link";
import { MembershipReviewActions } from "@/components/membership/review-actions";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { membershipTypeLabels } from "@/lib/membership/schema";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Membership Requests",
};

export default async function AdminMembersPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("membership_applications")
    .select(
      "id, full_name, email, phone, membership_type, status, district, state, membership_id, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-normal">
            Membership Requests
          </h1>
          <p className="mt-2 text-muted-foreground">
            Review applications and issue membership IDs.
          </p>
        </div>
        <Link
          href="/membership"
          className={cn(buttonVariants({ variant: "outline" }), "rounded-2xl")}
        >
          View public form
        </Link>
      </div>

      {error ? (
        <p className="mt-8 rounded-2xl bg-card p-6 text-sm text-destructive shadow-soft">
          Could not load applications. Run{" "}
          <code className="text-xs">20260801020000_membership.sql</code> in
          Supabase if needed. ({error.message})
        </p>
      ) : !data?.length ? (
        <p className="mt-8 rounded-2xl bg-card p-6 text-muted-foreground shadow-soft">
          No applications yet.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl bg-card shadow-soft">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border/70 last:border-0"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{row.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.phone || row.email}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {membershipTypeLabels[
                      row.membership_type as keyof typeof membershipTypeLabels
                    ] ?? row.membership_type}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {[row.district, row.state].filter(Boolean).join(", ")}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {row.membership_id || "—"}
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
    </>
  );
}
