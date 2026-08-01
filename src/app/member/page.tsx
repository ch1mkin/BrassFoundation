import Link from "next/link";
import { BrandLogo } from "@/components/brand/logo";
import { MembershipQr } from "@/components/membership/membership-qr";
import { buttonVariants } from "@/components/ui/button";
import { getUserContext } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { membershipTypeLabels } from "@/lib/membership/schema";
import { cn } from "@/lib/utils";

export default async function MemberDashboardPage() {
  const context = await getUserContext();
  const supabase = await createClient();

  const email = context?.email ?? null;
  const userId = context?.userId;

  let application = null as null | {
    id: string;
    full_name: string;
    email: string;
    membership_type: string;
    status: string;
    membership_id: string | null;
    district: string | null;
    state: string | null;
    approved_at: string | null;
  };

  if (userId) {
    const { data } = await supabase
      .from("membership_applications")
      .select(
        "id, full_name, email, membership_type, status, membership_id, district, state, approved_at",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    application = data;
  }

  if (!application && email) {
    const { data } = await supabase
      .from("membership_applications")
      .select(
        "id, full_name, email, membership_type, status, membership_id, district, state, approved_at",
      )
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    application = data;
  }

  const isApproved = application?.status === "approved";
  const displayName =
    application?.full_name ||
    context?.profile?.full_name ||
    context?.email ||
    "Member";

  return (
    <>
      <h1 className="font-heading text-3xl font-normal">Member Dashboard</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Welcome{displayName ? `, ${displayName}` : ""}. Manage your membership,
        card, and upcoming activity from here.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl bg-secondary p-6 text-white sm:p-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 90% 0%, rgba(17,181,201,0.35), transparent 55%)",
            }}
            aria-hidden
          />
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              {context?.profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={context.profile.avatar_url}
                  alt=""
                  className="size-14 shrink-0 rounded-full object-cover ring-2 ring-white/30"
                />
              ) : null}
              <div className="min-w-0">
                <p className="text-xs tracking-[0.18em] text-white/55 uppercase">
                  Brass Foundation
                </p>
                <p className="font-heading mt-3 text-2xl font-semibold">
                  {displayName}
                </p>
                <p className="mt-1 text-sm text-white/70">
                  {isApproved
                    ? membershipTypeLabels[
                        application!.membership_type as keyof typeof membershipTypeLabels
                      ] ?? application!.membership_type
                    : "Membership pending"}
                </p>
              </div>
            </div>
            <BrandLogo size="sm" href={null} />
          </div>

          <div className="relative z-10 mt-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs text-white/50 uppercase">Membership ID</p>
              <p className="mt-1 font-mono text-lg tracking-wide text-brand">
                {application?.membership_id || "Not issued"}
              </p>
              <p className="mt-3 text-xs text-white/50">
                Status:{" "}
                <span className="capitalize text-white/85">
                  {application?.status || "no application"}
                </span>
              </p>
            </div>
            {isApproved && application?.membership_id ? (
              <div className="rounded-xl bg-white p-2">
                <MembershipQr
                  membershipId={application.membership_id}
                  size={112}
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <h2 className="font-heading text-xl font-semibold">Next steps</h2>
          {!application ? (
            <>
              <p className="mt-3 text-sm text-muted-foreground">
                You have not submitted a membership application yet.
              </p>
              <Link
                href="/membership"
                className={cn(
                  buttonVariants(),
                  "mt-6 inline-flex rounded-xl bg-primary shadow-lg shadow-primary/20",
                )}
              >
                Apply for membership
              </Link>
            </>
          ) : application.status === "pending" ||
            application.status === "under_review" ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Your application is under review. You will receive a membership ID
              once an admin approves it.
            </p>
          ) : application.status === "rejected" ? (
            <>
              <p className="mt-3 text-sm text-muted-foreground">
                Your previous application was not approved. You may submit again
                with updated details.
              </p>
              <Link
                href="/membership"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "mt-6 inline-flex rounded-2xl",
                )}
              >
                Apply again
              </Link>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Your membership is active
              {application.district
                ? ` · ${[application.district, application.state].filter(Boolean).join(", ")}`
                : ""}
              . Keep this card for events and verification.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
