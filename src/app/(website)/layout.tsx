import { SiteFooter } from "@/components/website/site-footer";
import { SiteHeader } from "@/components/website/site-header";
import { canAccessAdmin, getUserContext } from "@/lib/auth/session";

export default async function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await getUserContext();
  const user = context
    ? {
        email: context.email,
        fullName: context.profile?.full_name ?? null,
        isAdmin: canAccessAdmin(context),
      }
    : null;

  return (
    <>
      <SiteHeader user={user} />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
