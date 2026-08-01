import type { Metadata } from "next";
import { HomepageCmsForm } from "@/app/admin/website/homepage-form";
import { getPublishedHomepage } from "@/lib/cms/homepage";

export const metadata: Metadata = {
  title: "Website CMS",
};

export default async function AdminWebsitePage() {
  const content = await getPublishedHomepage();

  return (
    <>
      <h1 className="font-heading text-3xl font-medium">Website CMS</h1>
      <p className="mt-2 mb-8 max-w-2xl text-muted-foreground">
        Edit homepage copy without code. Changes appear on the public site after
        save.
      </p>
      <HomepageCmsForm content={content} />
    </>
  );
}
