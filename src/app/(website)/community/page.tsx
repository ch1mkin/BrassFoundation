import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/website/page-shell";
import { MaterialIcon } from "@/components/ui/material-icon";
import { MembershipLink } from "@/components/membership/membership-link";
import { GOLD_SHINY_BTN } from "@/components/website/premium-accents";
import { ABOUT_PAGE, COMMUNITY_PAGE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Community Work",
  description: COMMUNITY_PAGE.headline,
};

export default function CommunityPage() {
  return (
    <PageShell
      eyebrow={COMMUNITY_PAGE.eyebrow}
      title={COMMUNITY_PAGE.title}
      description={COMMUNITY_PAGE.headline}
      wide
    >
      <div className="space-y-12">
        <p
          className="mx-auto max-w-3xl text-center text-base leading-relaxed text-muted-foreground sm:text-lg"
          data-i18n="content"
        >
          {COMMUNITY_PAGE.intro}
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {COMMUNITY_PAGE.initiatives.map((item) => (
            <article
              key={item.slug}
              id={item.slug}
              className="scroll-mt-28 rounded-2xl border border-border/50 bg-white p-6 sm:p-8"
            >
              <div className="mb-4 flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MaterialIcon name={item.icon} className="text-[26px]" />
                </div>
                <h2 className="font-heading text-xl font-semibold sm:text-2xl">
                  {item.title}
                </h2>
              </div>
              <p
                className="text-sm leading-relaxed text-muted-foreground sm:text-base"
                data-i18n="content"
              >
                {item.body}
              </p>
              {"impact" in item && item.impact ? (
                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {item.impact.map((line) => (
                    <li
                      key={line}
                      className="flex items-start gap-2 rounded-xl bg-primary/5 px-3 py-2 text-sm font-medium text-foreground"
                    >
                      <MaterialIcon
                        name="check_circle"
                        className="mt-0.5 text-[18px] text-primary"
                      />
                      <span className="notranslate" translate="no">
                        {line}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>

        <div className="rounded-2xl bg-surface-low px-6 py-8 text-center sm:px-10">
          <p className="text-muted-foreground">
            Learn more about our foundation story on the{" "}
            <Link href="/about" className="font-semibold text-primary">
              About Us
            </Link>{" "}
            page — {ABOUT_PAGE.headline}.
          </p>
          <MembershipLink
            className={cn(GOLD_SHINY_BTN, "mt-5 w-full shadow-lg sm:w-auto")}
          >
            <span>Become a Member</span>
            <MaterialIcon name="person_add" className="text-[20px]" />
          </MembershipLink>
        </div>
      </div>
    </PageShell>
  );
}
