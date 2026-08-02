"use client";

import Link from "next/link";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { MembershipLink } from "@/components/membership/membership-link";
import {
  GoldHairline,
  GOLD_SHINY_BTN,
} from "@/components/website/premium-accents";
import {
  COMMUNITY_WORK,
  FEATURED_BOOKS,
  RESOURCES_PREVIEW,
  UPCOMING_EVENTS,
} from "@/lib/constants";
import type { HomepageContent, HomepageQuote } from "@/lib/cms/homepage";
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
    <section className="relative bg-surface-low py-16 lg:py-20">
      <div
        className={`relative z-10 mx-auto grid max-w-[1280px] grid-cols-2 gap-6 px-4 sm:px-6 lg:px-20 ${cols}`}
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

function QuoteVisionSlider({ quotes }: { quotes: HomepageQuote[] }) {
  const slides =
    quotes.length > 0
      ? quotes
      : [
          {
            quote:
              "Education is the most powerful weapon which you can use to change the world.",
            attribution: "Dr. B. R. Ambedkar",
          },
        ];
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(id);
  }, [slides.length, index]);

  function go(delta: number) {
    setIndex((i) => (i + delta + slides.length) % slides.length);
  }

  function onPointerDown(e: React.PointerEvent) {
    if (slides.length <= 1) return;
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
  }

  function onPointerUp(e: React.PointerEvent) {
    if (
      touchStartX.current == null ||
      touchStartY.current == null ||
      slides.length <= 1
    ) {
      return;
    }
    const dx = e.clientX - touchStartX.current;
    const dy = e.clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    go(dx < 0 ? 1 : -1);
  }

  const current = slides[index]!;

  return (
    <div
      className="relative aspect-[16/10] touch-pan-y overflow-hidden rounded-2xl bg-surface-highest shadow-2xl sm:aspect-video"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        touchStartX.current = null;
        touchStartY.current = null;
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Vision quotes"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.35 }}
          className="absolute inset-0 select-none"
          drag={slides.length > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -50) go(1);
            else if (info.offset.x > 50) go(-1);
          }}
        >
          {current.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={current.image_url}
              alt=""
              className="pointer-events-none size-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-secondary/70 to-primary/40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
          <div className="absolute right-0 bottom-6 left-6 text-white sm:bottom-8 sm:left-8">
            <p className="font-quote max-w-md text-base font-medium italic sm:text-xl">
              &ldquo;{current.quote}&rdquo;
            </p>
            {current.attribution ? (
              <p className="mt-2 text-sm font-medium text-white/80">
                — {current.attribution}
              </p>
            ) : null}
          </div>
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 ? (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show quote ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                "size-2 rounded-full transition",
                i === index ? "bg-gold" : "bg-white/45 hover:bg-white/70",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function AboutSection({
  headline,
  body,
  values,
  quotes,
}: {
  eyebrow: string;
  headline: string;
  body: string;
  values: HomepageContent["core_values"];
  quotes: HomepageQuote[];
}) {
  const valueRows =
    values?.length > 0
      ? values.map((v, i) => ({
          title: v.title,
          description: v.description,
          icon: i % 2 === 0 ? "visibility" : "rocket_launch",
        }))
      : [];

  return (
    <section className="relative py-16 lg:py-20" id="about">
      <div className="relative z-10 mx-auto grid max-w-[1280px] items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-20">
        <QuoteVisionSlider quotes={quotes} />
        <div>
          <GoldHairline className="mb-4 ml-0" />
          <h2 className="font-heading mb-6 text-3xl font-semibold text-foreground">
            {headline}
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
            {body}
          </p>
          <div className="mb-8 space-y-6">
            {valueRows.map((item) => (
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
    <section className="relative py-16 lg:py-20" id="community">
      <div className="relative z-10 mx-auto mb-12 flex max-w-[1280px] flex-col items-start justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-end lg:px-20">
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
      <div className="relative z-10 mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-4 sm:px-6 md:grid-cols-3 lg:px-20">
        {projects.map((project, i) => (
          <Link
            key={project.slug}
            href={`/community/${project.slug}`}
            className="group block"
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
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
                <p className="mb-4 text-muted-foreground">
                  {project.description}
                </p>
              ) : null}
              <span className="inline-flex items-center gap-2 font-bold text-primary transition-all group-hover:gap-4">
                Read More
                <MaterialIcon name="arrow_right_alt" className="text-[18px]" />
              </span>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function EventsSection({
  backgroundUrl,
}: {
  backgroundUrl?: string | null;
}) {
  return (
    <section
      className="relative overflow-hidden bg-foreground py-16 text-background lg:py-20"
      id="events"
    >
      {backgroundUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={backgroundUrl}
            alt=""
            className="absolute inset-0 size-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-foreground/75" />
        </>
      ) : null}
      <div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-20">
        <h2 className="font-heading mb-3 text-center text-3xl font-semibold">
          Upcoming Events
        </h2>
        <GoldHairline className="mb-10" />
        <div className="space-y-4">
          {UPCOMING_EVENTS.map((event) => (
            <div
              key={event.title}
              className="flex flex-col items-center gap-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-[2px] transition hover:bg-white/10 md:flex-row"
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
    <section className="relative bg-muted py-12 sm:py-16 lg:py-20" id="resources">
      <div className="relative z-10 mx-auto mb-6 max-w-[1280px] px-4 sm:mb-12 sm:px-6 lg:px-20">
        <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
          Digital Library & Resources
        </h2>
      </div>
      <div className="relative z-10 mx-auto grid max-w-[1280px] grid-cols-2 gap-3 px-4 sm:gap-6 sm:px-6 md:grid-cols-4 lg:px-20">
        {RESOURCES_PREVIEW.map((item) => (
          <div
            key={item.title}
            className="glass-card group rounded-xl p-3 sm:rounded-2xl sm:p-6"
          >
            <div
              className={cn(
                "mb-2 flex aspect-[3/4] max-h-36 w-full items-center justify-center rounded-lg bg-surface-highest transition-all duration-300 sm:mb-4 sm:max-h-none sm:rounded-xl",
                toneClass[item.tone],
              )}
            >
              <MaterialIcon
                name={item.icon}
                className="text-[36px] sm:text-[64px]"
              />
            </div>
            <h4 className="font-heading mb-0.5 line-clamp-2 text-sm font-semibold sm:mb-1 sm:text-lg">
              {item.title}
            </h4>
            <p className="mb-2 line-clamp-2 text-[11px] text-muted-foreground sm:mb-4 sm:text-sm">
              {item.subtitle}
            </p>
            <div className="flex items-center justify-between gap-1">
              <span
                className="notranslate rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary sm:px-2 sm:py-1 sm:text-xs"
                translate="no"
              >
                {item.size}
              </span>
              <Link
                href="/resources"
                className="text-primary"
                aria-label="Download"
              >
                <MaterialIcon name="download" className="text-[18px] sm:text-[24px]" />
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
    <section className="overflow-hidden py-12 sm:py-16 lg:py-20">
      <div className="mx-auto mb-6 flex max-w-[1280px] items-center justify-between gap-3 px-4 sm:mb-12 sm:px-6 lg:px-20">
        <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
          Featured Books
        </h2>
        <Link
          href="/marketplace"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "rounded-full px-3 text-xs sm:px-4 sm:text-sm",
          )}
        >
          View all
        </Link>
      </div>
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-3 px-4 sm:grid-cols-2 sm:gap-6 sm:px-6 md:grid-cols-3 lg:px-20">
        {FEATURED_BOOKS.map((book) => (
          <Link
            key={book.title}
            href="/marketplace"
            className="block rounded-xl border border-border/40 bg-white p-4 transition hover:shadow-2xl sm:rounded-2xl sm:p-8"
          >
            <div className="mb-3 flex h-36 items-center justify-center rounded-lg bg-surface-highest sm:mb-4 sm:h-72 sm:rounded-xl">
              <MaterialIcon
                name="menu_book"
                className="text-4xl text-primary/40 sm:text-6xl"
              />
            </div>
            <h4 className="font-heading text-base font-semibold sm:text-xl">
              {book.title}
            </h4>
            <p className="mt-1 text-[11px] text-muted-foreground sm:mt-2 sm:text-xs">
              ({book.reviews} Reviews)
            </p>
            <div className="mt-3 flex items-center justify-between gap-2 sm:mt-6">
              <span className="font-heading text-lg font-semibold text-primary sm:text-2xl">
                {book.price}
              </span>
              <span className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white sm:px-6 sm:py-2 sm:text-sm">
                Buy Now
              </span>
            </div>
          </Link>
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
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-20">
        <div className="gold-radiant-card relative overflow-hidden rounded-2xl bg-secondary p-6 text-secondary-foreground sm:rounded-[32px] sm:p-16">
          <div className="relative z-10 flex flex-col items-center gap-8 lg:flex-row lg:gap-12">
            <div className="w-full lg:w-2/3">
              <h2 className="font-heading mb-4 text-3xl font-bold tracking-tight sm:mb-6 sm:text-4xl sm:text-5xl">
                {headline}
              </h2>
              <p className="mb-6 text-base text-white/80 sm:mb-10 sm:text-lg">
                {body}
              </p>
              <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-10 sm:gap-4 md:grid-cols-2">
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
              <MembershipLink
                className={cn(
                  GOLD_SHINY_BTN,
                  "h-auto w-full justify-center rounded-xl px-6 py-3.5 text-base shadow-2xl sm:w-auto sm:px-10 sm:py-4 sm:text-lg sm:hover:scale-105 active:scale-95",
                )}
              >
                <span>Start Your Membership</span>
              </MembershipLink>
            </div>
            <div className="flex justify-center lg:w-1/3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo.png"
                alt="Brass Foundation"
                className="floating-animation h-36 w-36 rounded-full bg-white object-contain p-3 shadow-2xl sm:h-56 sm:w-56 sm:p-4"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
