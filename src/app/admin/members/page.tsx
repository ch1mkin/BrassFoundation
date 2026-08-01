import type { Metadata } from "next";
import Link from "next/link";
import { MemberStatusForm } from "@/components/membership/member-status-form";
import { MembershipReviewActions } from "@/components/membership/review-actions";
import { MembershipQr } from "@/components/membership/membership-qr";
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
      "id, full_name, email, phone, membership_type, status, member_status, district, state, membership_id, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold">
            Membership Requests
          </h1>
          <p className="mt-2 text-muted-foreground">
            Approve members, issue QR membership IDs, and update leave status.
          </p>
        </div>
        <Link
          href="/membership"
          className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}
        >
          View public form
        </Link>
      </div>

      {error ? (
        <p className="mt-8 glass-card rounded-2xl p-6 text-sm text-destructive">
          Could not load applications. ({error.message})
        </p>
      ) : !data?.length ? (
        <p className="mt-8 glass-card rounded-2xl p-6 text-muted-foreground">
          No applications yet.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl bg-white shadow-soft">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">ID / QR</th>
                <th className="px-4 py-3 font-medium">Status</th>
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
                        <MembershipQr membershipId={row.membership_id} size={72} />
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <p className="capitalize text-xs">{row.status}</p>
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
    </>
  );
}
