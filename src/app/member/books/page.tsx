import type { Metadata } from "next";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";
import { InstantImg } from "@/components/website/instant-img";
import { getUserContext } from "@/lib/auth/session";
import { getMemberBookLibrary } from "@/lib/content/book-purchases";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "My Books" };

export default async function MemberBooksPage({
  searchParams,
}: {
  searchParams: Promise<{ pending?: string }>;
}) {
  const context = await getUserContext();
  if (!context) redirect("/login?next=/member/books");

  const params = await searchParams;
  const library = await getMemberBookLibrary(context.userId);
  const approved = library.filter((b) => b.status === "approved");
  const pending = library.filter((b) => b.status === "paid_awaiting_approval");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">My Books</h1>
        <p className="mt-2 text-muted-foreground">
          Purchased featured books stay here for web reading anytime. Access is
          unlocked after the owner confirms payment (usually within 24 hours).
        </p>
      </div>

      {params.pending ? (
        <p className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
          Payment received. Your book will appear as readable once the owner
          confirms — usually within 24 hours.
        </p>
      ) : null}

      {pending.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-heading text-lg font-semibold">Awaiting confirmation</h2>
          {pending.map((row) => {
            const item = row.marketplace_items;
            if (!item) return null;
            return (
              <div
                key={row.id}
                className="glass-card flex items-center gap-4 rounded-2xl p-4"
              >
                <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                  {item.cover_image_url ? (
                    <InstantImg
                      src={item.cover_image_url}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <MaterialIcon name="menu_book" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Pending owner confirmation
                  </p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                  Pending
                </span>
              </div>
            );
          })}
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Ready to read</h2>
        {approved.length === 0 ? (
          <p className="glass-card rounded-2xl p-6 text-sm text-muted-foreground">
            No purchased books yet.{" "}
            <Link href="/marketplace" className="font-semibold text-primary">
              Browse featured books
            </Link>
          </p>
        ) : (
          approved.map((row) => {
            const item = row.marketplace_items;
            if (!item) return null;
            return (
              <div
                key={row.id}
                className="glass-card flex items-center gap-4 rounded-2xl p-4"
              >
                <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                  {item.cover_image_url ? (
                    <InstantImg
                      src={item.cover_image_url}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <MaterialIcon name="menu_book" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.title}</p>
                  {item.author ? (
                    <p className="text-xs text-muted-foreground">{item.author}</p>
                  ) : null}
                </div>
                <Link
                  href={`/member/books/${item.slug}`}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white"
                >
                  Read
                </Link>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
