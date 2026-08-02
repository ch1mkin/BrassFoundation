import type { Metadata } from "next";
import { PageShell } from "@/components/website/page-shell";
import { MaterialIcon } from "@/components/ui/material-icon";
import { GoldMembershipCta } from "@/components/membership/gold-membership-cta";
import { LeadershipSection } from "@/components/website/executive-committee-section";
import { ABOUT_PAGE, CORE_VALUES } from "@/lib/constants";
import { getExecutiveCommittee } from "@/lib/content/committee";

export const metadata: Metadata = {
  title: "About Us",
  description: ABOUT_PAGE.headline,
};

export default async function AboutPage() {
  const committee = await getExecutiveCommittee();

  return (
    <PageShell
      eyebrow={ABOUT_PAGE.eyebrow}
      title={ABOUT_PAGE.title}
      description={ABOUT_PAGE.headline}
      wide
    >
      <div className="space-y-14">
        <article className="mx-auto max-w-3xl space-y-6">
          {ABOUT_PAGE.paragraphs.map((paragraph) => (
            <p
              key={paragraph.slice(0, 48)}
              className="text-base leading-relaxed text-muted-foreground sm:text-lg"
              data-i18n="content"
            >
              {paragraph}
            </p>
          ))}
          <div className="flex justify-center pt-4 sm:justify-start">
            <GoldMembershipCta className="w-full sm:w-auto" />
          </div>
        </article>

        <section className="border-t border-border/60 pt-12">
          <h2 className="font-heading mb-8 text-center text-2xl font-semibold sm:text-3xl">
            What Guides Us
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CORE_VALUES.map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MaterialIcon name={item.icon} />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="-mx-4 sm:-mx-6 lg:-mx-20">
          <LeadershipSection
            members={committee}
            viewAllHref="#executive-committee"
            showViewAll
          />
        </div>
      </div>
    </PageShell>
  );
}
