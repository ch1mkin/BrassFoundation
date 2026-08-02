import type { Metadata } from "next";
import { PageShell } from "@/components/website/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { MembershipLink } from "@/components/membership/membership-link";
import { LeadershipSection } from "@/components/website/executive-committee-section";
import { CORE_VALUES, SITE } from "@/lib/constants";
import { getExecutiveCommittee } from "@/lib/content/committee";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
};

export default async function AboutPage() {
  const committee = await getExecutiveCommittee();

  return (
    <PageShell
      eyebrow="About"
      title={`About ${SITE.name}`}
      description={SITE.description}
      wide
    >
      <div className="space-y-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-6">
            {CORE_VALUES.map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MaterialIcon name={item.icon} />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-semibold">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
            <MembershipLink
              className={cn(
                buttonVariants(),
                "mt-2 inline-flex rounded-xl bg-primary shadow-lg shadow-primary/20",
              )}
            >
              Become a Member
            </MembershipLink>
          </div>
          <div className="glass-card rounded-2xl p-6 text-muted-foreground">
            <p className="leading-relaxed">{SITE.description}</p>
          </div>
        </div>

        <div className="-mx-4 sm:-mx-6 lg:-mx-20">
          <LeadershipSection members={committee} />
        </div>
      </div>
    </PageShell>
  );
}
