import { redirect } from "next/navigation";
import { PortalSidebar } from "@/components/portal/portal-sidebar";
import { PortalNavProvider } from "@/components/portal/portal-nav-provider";
import { canAccessAdmin, getUserContext } from "@/lib/auth/session";
import { getAdminBackgroundUrl } from "@/lib/cms/homepage";
import { cdnMediaUrl } from "@/lib/media/cdn";

const NAV = [
  { label: "Overview", href: "/admin", icon: "dashboard" },
  { label: "Members", href: "/admin/members", icon: "group" },
  { label: "Referrals", href: "/admin/referrals", icon: "diversity_3" },
  { label: "Family members", href: "/admin/family-members", icon: "groups" },
  { label: "Payments", href: "/admin/payments", icon: "payments" },
  { label: "Messages", href: "/admin/messages", icon: "mail" },
  { label: "Website CMS", href: "/admin/website", icon: "web" },
  { label: "Achievers", href: "/admin/achievers", icon: "emoji_events" },
  { label: "Brochure", href: "/admin/brochure", icon: "menu_book" },
  { label: "Useful links", href: "/admin/useful-links", icon: "open_in_new" },
  { label: "Translations", href: "/admin/translations", icon: "translate" },
  { label: "Events", href: "/admin/events", icon: "event" },
  { label: "News", href: "/admin/news", icon: "newspaper" },
  { label: "Blogs", href: "/admin/blogs", icon: "edit_note" },
  { label: "Resources", href: "/admin/resources", icon: "menu_book" },
  { label: "Community Work", href: "/admin/community", icon: "diversity_3" },
  { label: "Marketplace", href: "/admin/marketplace", icon: "storefront" },
  { label: "Book purchases", href: "/admin/book-purchases", icon: "receipt_long" },
  { label: "Must Read", href: "/admin/must-read", icon: "auto_stories" },
  { label: "Gallery", href: "/admin/gallery", icon: "photo_library" },
  { label: "Executive Committee", href: "/admin/committee", icon: "groups" },
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

  const adminBackgroundUrl = await getAdminBackgroundUrl();

  return (
    <PortalNavProvider>
      <div className="notranslate relative flex min-h-[100svh] bg-surface-low">
        {adminBackgroundUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cdnMediaUrl(adminBackgroundUrl)}
              alt=""
              className="pointer-events-none absolute inset-0 size-full object-cover opacity-25"
            />
            <div className="pointer-events-none absolute inset-0 bg-surface-low/80" />
          </>
        ) : null}
        <PortalSidebar
          title="Admin Portal"
          subtitle={`${context.email || ""} · ${context.roles.map((r) => r.name).join(", ") || "No roles"}`}
          avatarUrl={context.profile?.avatar_url}
          nav={NAV}
          storageKey="bf-admin-sidebar-collapsed"
        />
        <main className="relative z-10 min-w-0 flex-1 p-6 pt-16 sm:p-8 md:pt-8">
          {children}
        </main>
      </div>
    </PortalNavProvider>
  );
}
