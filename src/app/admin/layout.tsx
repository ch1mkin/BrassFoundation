import { redirect } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/logo";
import { signOutAction } from "@/lib/auth/actions";
import { canAccessAdmin, getUserContext } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Overview", href: "/admin", icon: "dashboard" },
  { label: "Members", href: "/admin/members", icon: "group" },
  { label: "Messages", href: "/admin/messages", icon: "mail" },
  { label: "Website CMS", href: "/admin/website", icon: "web" },
  { label: "Events", href: "/admin/events", icon: "event" },
  { label: "News", href: "/admin/news", icon: "newspaper" },
  { label: "Resources", href: "/admin/resources", icon: "menu_book" },
  { label: "Community Work", href: "/admin/community", icon: "diversity_3" },
  { label: "Marketplace", href: "/admin/marketplace", icon: "storefront" },
  { label: "Gallery", href: "/admin/gallery", icon: "photo_library" },
  { label: "Family Tree", href: "/admin/family", icon: "account_tree" },
  { label: "Users", href: "/admin", icon: "manage_accounts" },
  { label: "Roles", href: "/admin", icon: "admin_panel_settings" },
  { label: "Analytics", href: "/admin", icon: "analytics" },
  { label: "Audit Logs", href: "/admin", icon: "history" },
  { label: "Settings", href: "/admin", icon: "settings" },
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
    <div className="flex min-h-[100svh] bg-surface-low">
      <aside className="hidden w-64 shrink-0 border-r border-border/40 bg-white p-6 md:block">
        <BrandLogo size="sm" showWordmark wordmarkClassName="text-sm font-bold text-primary" />
        <p className="mt-3 text-xs font-semibold tracking-wide text-primary uppercase">
          Admin Portal
        </p>
        <p className="mt-4 truncate text-xs text-muted-foreground">
          {context.email}
        </p>
        <p className="mt-1 text-xs font-medium text-secondary">
          {context.roles.map((r) => r.name).join(", ") || "No roles"}
        </p>
        <nav className="mt-8 max-h-[calc(100svh-14rem)] space-y-0.5 overflow-y-auto">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-low hover:text-foreground",
              )}
            >
              <span className="material-symbols-outlined text-[18px]">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={signOutAction} className="mt-6">
          <Button type="submit" variant="outline" className="w-full rounded-xl">
            Sign out
          </Button>
        </form>
      </aside>
      <main className="flex-1 p-6 sm:p-8">{children}</main>
    </div>
  );
}
