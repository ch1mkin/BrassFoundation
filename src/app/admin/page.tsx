import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin",
};

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

export default function AdminDashboardPage() {
  return (
    <div className="flex min-h-[100svh] bg-muted/40">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card p-6 md:block">
        <Link href="/" className="font-heading text-sm font-semibold text-primary">
          Brass Foundation
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">Admin Portal</p>
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
      </aside>
      <main className="flex-1 p-8">
        <h1 className="font-heading text-3xl font-semibold">Dashboard</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          CMS, dynamic roles, membership approvals, analytics, and audit logs
          will be wired here once Supabase schema and auth are connected.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["Members", "Pending Approvals", "Events", "Resources"].map(
            (label) => (
              <div
                key={label}
                className="rounded-2xl bg-card p-6 shadow-soft"
              >
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 font-heading text-3xl font-semibold">—</p>
              </div>
            ),
          )}
        </div>
      </main>
    </div>
  );
}
