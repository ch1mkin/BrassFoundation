import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Member Portal",
};

const NAV = [
  "Dashboard",
  "Profile",
  "Membership Card",
  "Certificates",
  "Downloads",
  "Events",
  "Volunteer Hours",
  "Marketplace",
  "Notifications",
  "Settings",
] as const;

export default function MemberDashboardPage() {
  return (
    <div className="flex min-h-[100svh] bg-muted/40">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card p-6 md:block">
        <Link href="/" className="font-heading text-sm font-semibold text-primary">
          Brass Foundation
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">Member Portal</p>
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
        <h1 className="font-heading text-3xl font-semibold">
          Member Dashboard
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Membership status, digital card, certificates, events, and volunteer
          hours will appear here after authentication is connected.
        </p>
        <div className="mt-10 max-w-md rounded-2xl bg-secondary p-6 text-secondary-foreground shadow-soft">
          <p className="text-xs tracking-wide text-white/60 uppercase">
            Membership Card Preview
          </p>
          <p className="mt-4 font-heading text-xl font-semibold">
            Digital Membership Card
          </p>
          <p className="mt-2 text-sm text-white/70">
            QR code · Membership ID · Status
          </p>
        </div>
      </main>
    </div>
  );
}
