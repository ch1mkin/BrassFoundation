import { redirect } from "next/navigation";
import { PortalSidebar } from "@/components/portal/portal-sidebar";
import { signOutAction } from "@/lib/auth/actions";
import { canAccessAdmin, getUserContext } from "@/lib/auth/session";

const NAV = [
  { label: "Overview", href: "/admin", icon: "dashboard" },
  { label: "Members", href: "/admin/members", icon: "group" },
  { label: "Messages", href: "/admin/messages", icon: "mail" },
  { label: "Website CMS", href: "/admin/website", icon: "web" },
  { label: "Stats & Homepage", href: "/admin/website", icon: "bar_chart" },
  { label: "Events", href: "/admin/events", icon: "event" },
  { label: "News", href: "/admin/news", icon: "newspaper" },
  { label: "Blogs", href: "/admin/blogs", icon: "edit_note" },
  { label: "Resources", href: "/admin/resources", icon: "menu_book" },
  { label: "Community Work", href: "/admin/community", icon: "diversity_3" },
  { label: "Marketplace", href: "/admin/marketplace", icon: "storefront" },
  { label: "Gallery", href: "/admin/gallery", icon: "photo_library" },
  { label: "Family Tree", href: "/admin/family", icon: "account_tree" },
  { label: "Users", href: "/admin/users", icon: "manage_accounts" },
  { label: "Roles", href: "/admin/roles", icon: "admin_panel_settings" },
  { label: "Analytics", href: "/admin/analytics", icon: "analytics" },
  { label: "Audit Logs", href: "/admin/audit", icon: "history" },
  { label: "Settings", href: "/admin/settings", icon: "settings" },
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
      <PortalSidebar
        title="Admin Portal"
        subtitle={`${context.email || ""} · ${context.roles.map((r) => r.name).join(", ") || "No roles"}`}
        nav={NAV}
        signOutAction={signOutAction}
        storageKey="bf-admin-sidebar-collapsed"
      />
      <main className="min-w-0 flex-1 p-6 pt-16 sm:p-8 md:pt-8">{children}</main>
    </div>
  );
}
