import { redirect } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/logo";
import { signOutAction } from "@/lib/auth/actions";
import { getUserContext } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";

const NAV = [
  { label: "Dashboard", href: "/member" },
  { label: "Membership Card", href: "/member" },
  { label: "Apply / Renew", href: "/membership" },
  { label: "Events", href: "/events" },
  { label: "Resources", href: "/resources" },
  { label: "Marketplace", href: "/marketplace" },
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
        <BrandLogo size="sm" showWordmark wordmarkClassName="text-sm" />
        <p className="mt-3 text-xs text-muted-foreground">Member Portal</p>
        <p className="mt-4 truncate text-sm font-medium">
          {context.profile?.full_name || context.email}
        </p>
        <nav className="mt-8 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block rounded-2xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
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
