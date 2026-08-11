import { BrandLogo } from "@/components/brand/logo";
import { MembershipQr } from "@/components/membership/membership-qr";
import { buttonVariants } from "@/components/ui/button";
import { getUserContext } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { membershipTypeLabels } from "@/lib/membership/schema";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/constants";

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

  let familyMembers: {
    id: string;
    full_name: string;
    payment_status: string | null;
    membership_id: string | null;
    age: number | null;
  }[] = [];

  if (userId) {
    const { data } = await supabase
      .from("family_members")
      .select("id, full_name, payment_status, membership_id, age")
      .eq("parent_user_id", userId)
      .order("created_at", { ascending: true })
      .limit(50);
    familyMembers = data || [];
  }

  const isApproved = application?.status === "approved";
  const displayName =
    application?.full_name ||
    context?.profile?.full_name ||
    context?.email ||
    "Member";

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-normal">Member Dashboard</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Welcome{displayName ? `, ${displayName}` : ""}. Manage your
            membership, card, and upcoming activity from here.
          </p>
        </div>
        <a
          href="/member/profile"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "rounded-xl",
          )}
        >
          Edit profile
        </a>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div
          id="membership-card"
          className="relative scroll-mt-8 overflow-hidden rounded-2xl bg-secondary p-6 text-white sm:p-8"
        >
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
                  {SITE.name}
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
              <a
                href="/membership"
                className={cn(
                  buttonVariants(),
                  "mt-6 inline-flex rounded-xl bg-primary shadow-lg shadow-primary/20",
                )}
              >
                Apply for membership
              </a>
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
              <a
                href="/membership"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "mt-6 inline-flex rounded-2xl",
                )}
              >
                Apply again
              </a>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-muted-foreground">
                Your membership is active
                {application.district
                  ? ` · ${[application.district, application.state].filter(Boolean).join(", ")}`
                  : ""}
                . Keep this card for events and verification.
              </p>
              <a
                href="/membership"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "mt-6 inline-flex rounded-xl",
                )}
              >
                Set up monthly contribution
              </a>
            </>
          )}
        </div>
      </div>

      <section className="glass-card mt-6 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl font-semibold">
              Family Membership Card
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Members under your household as head of family, with membership
              status.
            </p>
          </div>
          <a
            href="/member/family"
            className="text-sm font-semibold text-primary underline"
          >
            Manage family
          </a>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="pb-2 pr-4 font-semibold">Name</th>
                <th className="pb-2 pr-4 font-semibold">Age</th>
                <th className="pb-2 pr-4 font-semibold">Membership ID</th>
                <th className="pb-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-3 pr-4 font-medium">
                  {displayName}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (You · Head)
                  </span>
                </td>
                <td className="py-3 pr-4 text-muted-foreground">—</td>
                <td className="py-3 pr-4 font-mono text-xs">
                  {application?.membership_id || "—"}
                </td>
                <td className="py-3">
                  <StatusPill
                    status={
                      application?.membership_id ||
                      application?.status === "approved"
                        ? "Member"
                        : application?.status || "Pending"
                    }
                  />
                </td>
              </tr>
              {familyMembers.map((row) => (
                <tr key={row.id}>
                  <td className="py-3 pr-4 font-medium">{row.full_name}</td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {row.age ?? "—"}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs">
                    {row.membership_id || "—"}
                  </td>
                  <td className="py-3">
                    <StatusPill
                      status={
                        row.payment_status === "paid" || row.membership_id
                          ? "Member"
                          : row.payment_status === "unpaid"
                            ? "Unpaid"
                            : row.payment_status || "Pending"
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!familyMembers.length ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No family members added yet. Add relatives from{" "}
              <a href="/member/family" className="font-medium text-primary underline">
                Family
              </a>
              .
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
}

function StatusPill({ status }: { status: string }) {
  const lower = status.toLowerCase();
  const tone =
    lower === "member" || lower === "paid" || lower === "approved"
      ? "bg-emerald-500/15 text-emerald-800"
      : lower === "unpaid" || lower === "pending"
        ? "bg-amber-500/15 text-amber-900"
        : "bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold capitalize",
        tone,
      )}
    >
      {status}
    </span>
  );
}
