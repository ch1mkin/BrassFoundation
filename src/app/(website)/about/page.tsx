import type { Metadata } from "next";
import { PageShell } from "@/components/website/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
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
                <p className="mt-1 text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
          <a
            href="/membership#register"
            className={cn(
              buttonVariants(),
              "mt-2 inline-flex rounded-xl bg-primary shadow-lg shadow-primary/20",
            )}
          >
            Become a Member
          </a>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold">
            Executive Committee
          </h2>
          <p className="mt-2 text-muted-foreground">
            The committee guiding Brass Foundation&apos;s work in education and
            community development.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {committee.map((member) => (
              <div
                key={member.id}
                className="glass-card flex gap-3 rounded-2xl p-4"
              >
                <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-highest">
                  {member.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.photo_url}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-primary/40">
                      Photo
                    </span>
                  )}
                </span>
                <div className="min-w-0">
                  <h3 className="font-heading font-semibold">
                    {member.full_name}
                  </h3>
                  <p className="mt-0.5 text-sm font-medium text-primary">
                    {member.role_title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
