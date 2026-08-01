import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand/logo";
import { signOutAction } from "@/lib/auth/actions";
import { getUserContext } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";

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

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await getUserContext();

  if (!context) {
    redirect("/login?next=/member");
  }

  return (
    <div className="flex min-h-[100svh] bg-muted/40">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card p-6 md:block">
        <BrandLogo size="sm" />
        <p className="mt-3 text-xs text-muted-foreground">Member Portal</p>
        <p className="mt-4 truncate text-sm font-medium">
          {context.profile?.full_name || context.email}
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
