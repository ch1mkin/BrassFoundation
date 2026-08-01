import { SiteFooter } from "@/components/website/site-footer";
import { SiteHeader } from "@/components/website/site-header";

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
