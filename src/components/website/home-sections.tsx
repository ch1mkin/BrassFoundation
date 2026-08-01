"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import {
  COMMUNITY_WORK,
  CORE_VALUES,
  FEATURED_BOOKS,
  LEADERSHIP,
  RESOURCES_PREVIEW,
  UPCOMING_EVENTS,
} from "@/lib/constants";
import type { HomepageContent } from "@/lib/cms/homepage";
import { cn } from "@/lib/utils";

function AnimatedCounter({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(value * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <span ref={ref} className="notranslate" translate="no">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function StatsSection({
  stats,
}: {
  stats: HomepageContent["stats"];
}) {
  const cols =
    stats.length <= 2
      ? "md:grid-cols-2"
      : stats.length === 3
        ? "md:grid-cols-3"
        : stats.length === 4
          ? "md:grid-cols-4"
          : "md:grid-cols-5";

  return (
    <section className="bg-surface-low py-16 lg:py-20">
      <div
        className={`mx-auto grid max-w-[1280px] grid-cols-2 gap-6 px-4 sm:px-6 lg:px-20 ${cols}`}
      >
        {stats.map((stat, i) => (
          <div
            key={`${stat.label}-${i}`}
            className="glass-card rounded-xl p-6 text-center transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(17,76,136,0.08)]"
          >
            <MaterialIcon
              name={stat.icon || "groups"}
              className={cn(
                "mb-2 text-4xl",
                i % 3 === 0 && "text-primary",
                i % 3 === 1 && "text-secondary",
                i % 3 === 2 && "text-tertiary",
              )}
            />
            <div className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </div>
            <div
              className="mt-1 text-sm font-medium text-muted-foreground"
              data-i18n="content"
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AboutSection({
  headline,
  body,
}: {
  eyebrow: string;
  headline: string;
  body: string;
  values: HomepageContent["core_values"];
}) {
  return (
    <section className="py-16 lg:py-20" id="about">
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-20">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-surface-highest shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-secondary/70 to-primary/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute right-0 bottom-6 left-6 text-white">
            <p className="font-heading max-w-md text-lg font-medium italic sm:text-xl">
              &ldquo;Education is the most powerful weapon which you can use to
              change the world.&rdquo;
            </p>
          </div>
        </div>
        <div>
          <h2 className="font-heading mb-6 text-3xl font-semibold text-foreground">
            {headline}
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
            {body}
          </p>
          <div className="mb-8 space-y-6">
            {CORE_VALUES.map((item) => (
              <div key={item.title} className="flex gap-4">
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-lg",
                    item.icon === "visibility"
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary/10 text-secondary",
                  )}
                >
                  <MaterialIcon name={item.icon} />
                </div>
                <div>
                  <h4 className="font-heading text-xl font-semibold text-foreground">
                    {item.title}
                  </h4>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary transition-all hover:gap-4"
          >
            READ MORE ABOUT OUR STORY
            <MaterialIcon name="arrow_forward" className="text-[18px]" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function LeadershipSection() {
  return (
    <section className="bg-surface-high py-16 lg:py-20">
      <div className="mx-auto mb-12 max-w-[1280px] px-4 text-center sm:px-6 lg:px-20">
        <h2 className="font-heading mb-3 text-3xl font-semibold">
          Our Leadership
        </h2>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Guided by visionaries and community leaders dedicated to the cause of
          social justice.
        </p>
      </div>
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-20">
        {LEADERSHIP.map((leader, i) => (
          <motion.div
            key={leader.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="glass-card group rounded-2xl p-8 text-center"
          >
            <div className="mx-auto mb-4 flex size-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-surface-highest shadow-lg transition-transform group-hover:scale-105">
              <span className="font-heading text-3xl font-bold text-primary">
                {leader.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </span>
            </div>
            <h3 className="font-heading text-xl font-semibold text-foreground">
              {leader.name}
            </h3>
            <p className="mb-4 text-sm font-medium text-primary">
              {leader.role}
            </p>
            <p className="mb-6 text-sm text-muted-foreground">{leader.bio}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function CommunitySection({
  items,
}: {
  items: HomepageContent["community_work"];
}) {
  const projects = COMMUNITY_WORK.length
    ? COMMUNITY_WORK
    : items.map((item) => ({
        ...item,
        description: "",
        badge: "ONGOING" as const,
        badgeTone: "primary" as const,
      }));

  return (
    <section className="py-16 lg:py-20" id="community">
      <div className="mx-auto mb-12 flex max-w-[1280px] flex-col items-start justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-end lg:px-20">
        <div className="max-w-xl">
          <h2 className="font-heading mb-3 text-3xl font-semibold">
            Our Community Initiatives
          </h2>
          <p className="text-muted-foreground">
            We believe in holistic development, ranging from health awareness to
            educational empowerment.
          </p>
        </div>
        <Link
          href="/community"
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "rounded-lg bg-surface-highest font-bold text-primary hover:bg-surface-high",
          )}
        >
          View All Work
          <MaterialIcon name="trending_flat" className="text-[18px]" />
        </Link>
      </div>
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-4 sm:px-6 md:grid-cols-3 lg:px-20">
        {projects.map((project, i) => (
          <motion.div
            key={project.slug}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="group cursor-pointer"
          >
            <div className="relative mb-4 h-64 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-tertiary/20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(17,181,201,0.35),transparent_55%)] transition-transform duration-500 group-hover:scale-110" />
              {"badge" in project && project.badge ? (
                <div className="absolute top-4 left-4">
                  <span
                    className={cn(
                      "rounded-full px-4 py-1 text-xs font-semibold text-white",
                      project.badgeTone === "error" && "bg-destructive",
                      project.badgeTone === "primary" && "bg-primary",
                      project.badgeTone === "secondary" && "bg-secondary",
                    )}
                  >
                    {project.badge}
                  </span>
                </div>
              ) : null}
            </div>
            <h3 className="font-heading mb-2 text-xl font-semibold">
              {project.title}
            </h3>
            {"description" in project && project.description ? (
              <p className="mb-4 text-muted-foreground">{project.description}</p>
            ) : null}
            <Link
              href={`/community/${project.slug}`}
              className="inline-flex items-center gap-2 font-bold text-primary transition-all hover:gap-4"
            >
              Read More
              <MaterialIcon name="arrow_right_alt" className="text-[18px]" />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function EventsSection() {
  return (
    <section className="bg-foreground py-16 text-background lg:py-20" id="events">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-20">
        <h2 className="font-heading mb-12 text-center text-3xl font-semibold">
          Upcoming Events
        </h2>
        <div className="space-y-4">
          {UPCOMING_EVENTS.map((event) => (
            <div
              key={event.title}
              className="flex flex-col items-center gap-8 rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10 md:flex-row"
            >
              <div
                className={cn(
                  "flex size-24 shrink-0 flex-col items-center justify-center rounded-xl text-white",
                  event.tone === "primary" ? "bg-primary" : "bg-secondary",
                )}
              >
                <span className="text-xs font-semibold">{event.month}</span>
                <span className="font-heading text-3xl font-bold">
                  {event.day}
                </span>
              </div>
              <div className="flex-grow text-center md:text-left">
                <h4 className="font-heading mb-2 text-xl font-semibold">
                  {event.title}
                </h4>
                <p className="flex items-center justify-center gap-2 text-white/60 md:justify-start">
                  <MaterialIcon
                    name={event.locationIcon}
                    className="text-[18px]"
                  />
                  <span data-i18n="content">{event.location}</span>
                </p>
              </div>
              <Link
                href="/events"
                className={cn(
                  "rounded-lg px-8 py-2 text-sm font-bold text-white transition active:scale-95",
                  event.tone === "primary" ? "bg-primary" : "bg-secondary",
                )}
              >
                Register
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ResourcesSection() {
  const toneClass = {
    primary: "text-primary group-hover:bg-primary group-hover:text-white",
    secondary:
      "text-secondary group-hover:bg-secondary group-hover:text-white",
    tertiary: "text-tertiary group-hover:bg-tertiary group-hover:text-white",
    brand: "text-brand group-hover:bg-brand group-hover:text-brand-foreground",
  };

  return (
    <section className="bg-muted py-16 lg:py-20" id="resources">
      <div className="mx-auto mb-12 max-w-[1280px] px-4 sm:px-6 lg:px-20">
        <h2 className="font-heading text-3xl font-semibold">
          Digital Library & Resources
        </h2>
      </div>
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-4 sm:px-6 md:grid-cols-4 lg:px-20">
        {RESOURCES_PREVIEW.map((item) => (
          <div key={item.title} className="glass-card group rounded-2xl p-6">
            <div
              className={cn(
                "mb-4 flex aspect-[3/4] w-full items-center justify-center rounded-xl bg-surface-highest transition-all duration-300",
                toneClass[item.tone],
              )}
            >
              <MaterialIcon name={item.icon} className="text-[64px]" />
            </div>
            <h4 className="font-heading mb-1 text-lg font-semibold">
              {item.title}
            </h4>
            <p className="mb-4 text-sm text-muted-foreground">{item.subtitle}</p>
            <div className="flex items-center justify-between">
              <span
                className="notranslate rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary"
                translate="no"
              >
                {item.size}
              </span>
              <Link href="/resources" className="text-primary" aria-label="Download">
                <MaterialIcon name="download" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MarketplaceSection() {
  return (
    <section className="overflow-hidden py-16 lg:py-20">
      <div className="mx-auto mb-12 flex max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-20">
        <h2 className="font-heading text-3xl font-semibold">Featured Books</h2>
        <Link
          href="/marketplace"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "rounded-full",
          )}
        >
          View all
        </Link>
      </div>
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-4 sm:px-6 md:grid-cols-3 lg:px-20">
        {FEATURED_BOOKS.map((book) => (
          <div
            key={book.title}
            className="rounded-2xl border border-border/40 bg-white p-8 transition hover:shadow-2xl"
          >
            <div className="mb-4 flex h-72 items-center justify-center rounded-xl bg-surface-highest">
              <MaterialIcon
                name="menu_book"
                className="text-6xl text-primary/40"
              />
            </div>
            <h4 className="font-heading text-xl font-semibold">{book.title}</h4>
            <p className="mt-2 text-xs text-muted-foreground">
              ({book.reviews} Reviews)
            </p>
            <div className="mt-6 flex items-center justify-between">
              <span className="font-heading text-2xl font-semibold text-primary">
                {book.price}
              </span>
              <Link
                href="/marketplace"
                className="rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white"
              >
                Buy Now
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MembershipCta({
  headline,
  body,
}: {
  headline: string;
  body: string;
}) {
  return (
    <section className="py-16 lg:py-20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-20">
        <div className="relative overflow-hidden rounded-[32px] bg-secondary p-10 text-secondary-foreground sm:p-16">
          <div className="relative z-10 flex flex-col items-center gap-12 lg:flex-row">
            <div className="lg:w-2/3">
              <h2 className="font-heading mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
                {headline}
              </h2>
              <p className="mb-10 text-lg text-white/80">{body}</p>
              <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  "Exclusive Access to Digital Library",
                  "Volunteer Opportunities",
                  "Direct Community Impact",
                  "Skill Development Workshops",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <MaterialIcon
                      name="check_circle"
                      className="text-brand"
                    />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/membership"
                className="inline-flex rounded-xl bg-white px-10 py-4 text-lg font-bold text-secondary shadow-2xl transition hover:scale-105 active:scale-95"
              >
                Start Your Membership
              </Link>
            </div>
            <div className="flex justify-center lg:w-1/3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo.png"
                alt="Brass Foundation"
                className="floating-animation h-56 w-56 rounded-full bg-white object-contain p-4 shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
