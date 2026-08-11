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

      <section
        id="family-membership-card"
        className="relative mt-6 overflow-hidden rounded-2xl bg-secondary p-6 text-white sm:p-8"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 55% 45% at 10% 0%, rgba(17,181,201,0.32), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 100%, rgba(245,158,11,0.18), transparent 50%)",
          }}
          aria-hidden
        />
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs tracking-[0.18em] text-white/55 uppercase">
              {SITE.name}
            </p>
            <h2 className="font-heading mt-2 text-2xl font-semibold">
              Family Membership Card
            </h2>
            <p className="mt-1 text-sm text-white/70">
              Household of {displayName} · Head of family
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/member/family"
              className="rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Manage family
            </a>
            <BrandLogo size="sm" href={null} />
          </div>
        </div>

        <div className="relative z-10 mt-6 space-y-3">
          <FamilyCardRow
            name={`${displayName} (Head)`}
            meta={application?.membership_id || "ID pending"}
            status={
              application?.membership_id || application?.status === "approved"
                ? "Member"
                : application?.status || "Pending"
            }
          />
          {familyMembers.map((row) => (
            <FamilyCardRow
              key={row.id}
              name={row.full_name}
              meta={[
                typeof row.age === "number" ? `Age ${row.age}` : null,
                row.membership_id || null,
              ]
                .filter(Boolean)
                .join(" · ") || "—"}
              status={
                row.payment_status === "paid" || row.membership_id
                  ? "Member"
                  : row.payment_status === "unpaid"
                    ? "Unpaid"
                    : row.payment_status || "Pending"
              }
            />
          ))}
          {!familyMembers.length ? (
            <p className="rounded-xl border border-dashed border-white/25 bg-white/5 px-4 py-5 text-sm text-white/65">
              No family members added yet. Add relatives from{" "}
              <a href="/member/family" className="font-semibold text-brand underline">
                Family
              </a>
              .
            </p>
          ) : null}
        </div>

        <div className="relative z-10 mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-white/15 pt-5">
          <div>
            <p className="text-xs text-white/50 uppercase">Household size</p>
            <p className="mt-1 font-mono text-lg tracking-wide text-brand">
              {1 + familyMembers.length} member
              {1 + familyMembers.length === 1 ? "" : "s"}
            </p>
          </div>
          <p className="text-xs text-white/50">
            Primary ID: {application?.membership_id || "Not issued"}
          </p>
        </div>
      </section>
    </>
  );
}

function FamilyCardRow({
  name,
  meta,
  status,
}: {
  name: string;
  meta: string;
  status: string;
}) {
  const lower = status.toLowerCase();
  const tone =
    lower === "member" || lower === "paid" || lower === "approved"
      ? "bg-emerald-400/20 text-emerald-100 ring-emerald-300/30"
      : lower === "unpaid" || lower === "pending"
        ? "bg-amber-400/20 text-amber-100 ring-amber-300/30"
        : "bg-white/10 text-white/80 ring-white/15";
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-[2px]">
      <div className="min-w-0">
        <p className="truncate font-medium text-white">{name}</p>
        <p className="mt-0.5 truncate font-mono text-xs text-white/55">{meta}</p>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1",
          tone,
        )}
      >
        {status}
      </span>
    </div>
  );
}
