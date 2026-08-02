import type { Metadata } from "next";
import { AdminPurchaseActionButton } from "@/components/admin/admin-purchase-action-button";
import {
  confirmBookPurchaseAction,
  rejectBookPurchaseAction,
} from "@/lib/content/book-purchase-actions";
import { getPendingBookPurchasesForAdmin } from "@/lib/content/book-purchases";

export const metadata: Metadata = { title: "Admin · Book purchases" };

export default async function AdminBookPurchasesPage() {
  let rows: Awaited<ReturnType<typeof getPendingBookPurchasesForAdmin>> = [];
  let error: string | null = null;
  try {
    rows = await getPendingBookPurchasesForAdmin();
  } catch (err) {
    error = err instanceof Error ? err.message : "Could not load purchases.";
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Book purchases</h1>
        <p className="mt-2 text-muted-foreground">
          Confirm payments to unlock web reading for the member (target: within
          24 hours). Buyer account details are stored with each purchase.
        </p>
      </div>

      {error ? (
        <p className="glass-card rounded-2xl p-6 text-sm text-destructive">
          {error}. Run{" "}
          <code className="text-xs">
            supabase/migrations/20260802060000_book_purchases.sql
          </code>{" "}
          in Supabase if the table is missing.
        </p>
      ) : null}

      {rows.length === 0 && !error ? (
        <p className="glass-card rounded-2xl p-6 text-sm text-muted-foreground">
          No purchases awaiting confirmation.
        </p>
      ) : null}

      <div className="space-y-4">
        {rows.map((row) => {
          const item = Array.isArray(row.marketplace_items)
            ? row.marketplace_items[0]
            : row.marketplace_items;
          return (
            <div key={row.id} className="glass-card rounded-2xl p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-heading text-lg font-semibold">
                    {item?.title || "Book"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item?.price_label}
                    {item?.author ? ` · ${item.author}` : ""}
                  </p>
                  <dl className="mt-4 grid gap-1 text-sm">
                    <div>
                      <span className="text-muted-foreground">Buyer: </span>
                      {row.buyer_name || "—"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email: </span>
                      {row.buyer_email || "—"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone: </span>
                      {row.buyer_phone || "—"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Paid at: </span>
                      {row.paid_at
                        ? new Date(row.paid_at).toLocaleString()
                        : "—"}
                    </div>
                  </dl>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminPurchaseActionButton
                    id={row.id}
                    action={confirmBookPurchaseAction}
                    label="Confirm access"
                    pendingLabel="Confirming…"
                    variant="success"
                  />
                  <AdminPurchaseActionButton
                    id={row.id}
                    action={rejectBookPurchaseAction}
                    label="Reject"
                    pendingLabel="Rejecting…"
                    variant="danger"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
