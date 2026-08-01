import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/website/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { CORE_VALUES, LEADERSHIP, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
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
          <Link
            href="/membership"
            className={cn(
              buttonVariants(),
              "mt-2 inline-flex rounded-xl bg-primary shadow-lg shadow-primary/20",
            )}
          >
            Become a Member
          </Link>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold">Leadership</h2>
          <p className="mt-2 text-muted-foreground">
            Guided by community leaders dedicated to education and social
            justice.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {LEADERSHIP.map((leader) => (
              <div key={leader.name} className="glass-card rounded-2xl p-5">
                <h3 className="font-heading font-semibold">{leader.name}</h3>
                <p className="mt-1 text-sm font-medium text-primary">
                  {leader.role}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{leader.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
