import { redirect } from "next/navigation";
import { PortalSidebar } from "@/components/portal/portal-sidebar";
import { PortalNavProvider } from "@/components/portal/portal-nav-provider";
import { getUserContext } from "@/lib/auth/session";

const NAV = [
  { label: "Dashboard", href: "/member", icon: "dashboard" },
  { label: "Membership Card", href: "/member#membership-card", icon: "badge" },
  { label: "Payments", href: "/member/payments", icon: "payments" },
  { label: "Join / Contribute", href: "/membership", icon: "volunteer_activism" },
  { label: "Events", href: "/events", icon: "event" },
  { label: "Resources", href: "/resources", icon: "menu_book" },
  { label: "Marketplace", href: "/marketplace", icon: "storefront" },
  { label: "Blog", href: "/blog", icon: "article" },
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
    <PortalNavProvider>
      <div className="flex min-h-[100svh] bg-surface-low">
        <PortalSidebar
          title="Member Portal"
          subtitle={context.profile?.full_name || context.email}
          avatarUrl={context.profile?.avatar_url}
          nav={NAV}
          storageKey="bf-member-sidebar-collapsed"
        />
        <main className="min-w-0 flex-1 p-6 pt-16 sm:p-8 md:pt-8">
          {children}
        </main>
      </div>
    </PortalNavProvider>
  );
}
