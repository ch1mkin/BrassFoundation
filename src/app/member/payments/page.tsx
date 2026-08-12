import type { Metadata } from "next";
import { OneTimeContributionSection } from "@/components/membership/one-time-contribution-section";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { formatInrFromPaise } from "@/lib/payments/constants";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "My payments" };

export default async function MemberPaymentsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/member/payments");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone")
    .eq("id", user.id)
    .maybeSingle();

  const { data: tx } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(40);

  const { data: mandates } = await supabase
    .from("payment_mandates")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          Contributions & payments
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Make a one-time gift with a note, and review registration fees,
          mandates, and payment history.
        </p>
      </div>

      <OneTimeContributionSection
        defaultName={profile?.full_name || undefined}
        defaultEmail={profile?.email || undefined}
        defaultPhone={profile?.phone || undefined}
      />

      <section className="glass-card space-y-3 rounded-2xl p-6">
        <h2 className="font-heading text-lg font-semibold">Your history</h2>
        <ul className="divide-y divide-border">
          {(tx || []).map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between gap-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">
                  {row.description || row.type}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(row.created_at).toLocaleString("en-IN")} ·{" "}
                  {row.status}
                </p>
              </div>
              <p className="font-semibold">
                {formatInrFromPaise(row.amount_paise)}
              </p>
            </li>
          ))}
          {!tx?.length ? (
            <li className="py-6 text-center text-sm text-muted-foreground">
              No payments yet.
            </li>
          ) : null}
        </ul>
      </section>

      {mandates?.length ? (
        <section className="glass-card space-y-3 rounded-2xl p-6">
          <h2 className="font-heading text-lg font-semibold">
            Active mandates
          </h2>
          <ul className="space-y-2 text-sm">
            {mandates.map((m) => (
              <li
                key={m.id}
                className="flex justify-between rounded-xl bg-surface-low px-3 py-2"
              >
                <span>
                  {formatInrFromPaise(m.amount_paise)}/month · {m.status}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {m.razorpay_subscription_id}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
