import { redirect } from "next/navigation";
import Link from "next/link";
import { signOutAction } from "@/lib/auth/actions";
import { canAccessAdmin, getUserContext } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";

const NAV = [
  "Overview",
  "Members",
  "Users",
  "Roles",
  "Website CMS",
  "Gallery",
  "Marketplace",
  "Resources",
  "Events",
  "Community Work",
  "News",
  "Messages",
  "Membership Requests",
  "Analytics",
  "Audit Logs",
  "Settings",
] as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await getUserContext();

  if (!context) {
    redirect("/login?next=/admin");
  }

  if (!canAccessAdmin(context)) {
    redirect("/member");
  }

  return (
    <div className="flex min-h-[100svh] bg-muted/40">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card p-6 md:block">
        <Link
          href="/"
          className="font-heading text-sm font-semibold text-primary"
        >
          Brass Foundation
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">Admin Portal</p>
        <p className="mt-4 truncate text-xs text-muted-foreground">
          {context.email}
        </p>
        <p className="mt-1 text-xs text-primary">
          {context.roles.map((r) => r.name).join(", ") || "No roles"}
        </p>
        <nav className="mt-8 space-y-1">
          {NAV.map((item) => (
            <div
              key={item}
              className="rounded-2xl px-3 py-2 text-sm text-muted-foreground"
            >
              {item}
            </div>
          ))}
        </nav>
        <form action={signOutAction} className="mt-8">
          <Button type="submit" variant="outline" className="w-full rounded-2xl">
            Sign out
          </Button>
        </form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
