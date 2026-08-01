import { redirect } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/logo";
import { signOutAction } from "@/lib/auth/actions";
import { getUserContext } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";

const NAV = [
  { label: "Dashboard", href: "/member", icon: "dashboard" },
  { label: "Membership Card", href: "/member", icon: "badge" },
  { label: "Apply / Renew", href: "/membership", icon: "person_add" },
  { label: "Events", href: "/events", icon: "event" },
  { label: "Resources", href: "/resources", icon: "menu_book" },
  { label: "Marketplace", href: "/marketplace", icon: "storefront" },
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
    <div className="flex min-h-[100svh] bg-surface-low">
      <aside className="hidden w-64 shrink-0 border-r border-border/40 bg-white p-6 md:block">
        <BrandLogo
          size="sm"
          showWordmark
          wordmarkClassName="text-sm font-bold text-primary"
        />
        <p className="mt-3 text-xs font-semibold tracking-wide text-primary uppercase">
          Member Portal
        </p>
        <p className="mt-4 truncate text-sm font-medium">
          {context.profile?.full_name || context.email}
        </p>
        <nav className="mt-8 space-y-0.5">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-low hover:text-foreground"
            >
              <span className="material-symbols-outlined text-[18px]">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={signOutAction} className="mt-8">
          <Button type="submit" variant="outline" className="w-full rounded-xl">
            Sign out
          </Button>
        </form>
      </aside>
      <main className="flex-1 p-6 sm:p-8">{children}</main>
    </div>
  );
}
