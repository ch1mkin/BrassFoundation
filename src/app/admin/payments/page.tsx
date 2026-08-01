import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatInrFromPaise } from "@/lib/payments/constants";

export const metadata: Metadata = { title: "Payments" };

export default async function AdminPaymentsPage() {
  const supabase = await createClient();
  const { data: tx } = await supabase
    .from("transactions")
    .select(
      "id, type, amount_paise, status, description, razorpay_payment_id, created_at, user_id, profiles(full_name, email)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const { data: mandates } = await supabase
    .from("payment_mandates")
    .select(
      "id, amount_paise, status, razorpay_subscription_id, created_at, user_id, profiles(full_name, email)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          Payments & contributions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registration fees, monthly mandates, and transaction history for all
          members.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Transactions</h2>
        <div className="overflow-x-auto rounded-2xl bg-card shadow-soft">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-surface-low text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment ID</th>
              </tr>
            </thead>
            <tbody>
              {(tx || []).map((row) => {
                const profile = Array.isArray(row.profiles)
                  ? row.profiles[0]
                  : row.profiles;
                return (
                  <tr key={row.id} className="border-b border-border/60">
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(row.created_at).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {(profile as { full_name?: string } | null)?.full_name ||
                          "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(profile as { email?: string } | null)?.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">{row.type}</td>
                    <td className="px-4 py-3 font-semibold">
                      {formatInrFromPaise(row.amount_paise)}
                    </td>
                    <td className="px-4 py-3">{row.status}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {row.razorpay_payment_id || "—"}
                    </td>
                  </tr>
                );
              })}
              {!tx?.length ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No transactions yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">
          Monthly mandates
        </h2>
        <div className="overflow-x-auto rounded-2xl bg-card shadow-soft">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-surface-low text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Subscription</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {(mandates || []).map((row) => {
                const profile = Array.isArray(row.profiles)
                  ? row.profiles[0]
                  : row.profiles;
                return (
                  <tr key={row.id} className="border-b border-border/60">
                    <td className="px-4 py-3">
                      {(profile as { full_name?: string } | null)?.full_name ||
                        "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {formatInrFromPaise(row.amount_paise)}/mo
                    </td>
                    <td className="px-4 py-3">{row.status}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {row.razorpay_subscription_id}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(row.created_at).toLocaleString("en-IN")}
                    </td>
                  </tr>
                );
              })}
              {!mandates?.length ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No mandates yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
