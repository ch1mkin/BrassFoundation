"use client";

import Link from "next/link";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";
import { MembershipLink } from "@/components/membership/membership-link";
import {
  GoldHairline,
  GOLD_SHINY_BTN,
} from "@/components/website/premium-accents";
import {
  COMMUNITY_WORK,
} from "@/lib/constants";
import type { HomepageContent, HomepageQuote } from "@/lib/cms/homepage";
import type {
  CommunityRow,
  EventRow,
  MarketplaceRow,
} from "@/lib/content/queries";
import type { BookPurchaseStatus } from "@/lib/content/book-purchases";
import type { ResourceCategoryRow } from "@/lib/content/resource-categories";
import { cn } from "@/lib/utils";
import { InstantImg, preloadImages } from "@/components/website/instant-img";
import { MemberMilestoneConfetti } from "@/components/website/member-milestone-confetti";
import { MustReadBookCard } from "@/components/website/must-read-book-card";
import { BookBuyButton } from "@/components/marketplace/book-buy-button";
import { ViewAllLink } from "@/components/website/view-all-link";
import { HardNavLink } from "@/components/website/hard-nav-link";

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
  liveMemberCount,
}: {
  stats: HomepageContent["stats"];
  liveMemberCount?: number | null;
}) {
  const count = stats.length;
  const cols =
    count <= 2
      ? "md:grid-cols-2"
      : count === 3
        ? "md:grid-cols-3"
        : count === 4
          ? "md:grid-cols-4"
          : count === 5
            ? "md:grid-cols-5"
            : "md:grid-cols-3 lg:grid-cols-6";

  const displayStats = stats.map((stat) => {
    const isMembers = /member/i.test(stat.label);
    if (isMembers && typeof liveMemberCount === "number") {
      return { ...stat, value: liveMemberCount, suffix: "+" };
    }
    return stat;
  });

  return (
    <section className="relative bg-surface-low py-12 lg:py-16">
      {typeof liveMemberCount === "number" ? (
        <MemberMilestoneConfetti count={liveMemberCount} />
      ) : null}
      <div
        className={`relative z-10 mx-auto grid max-w-[1280px] grid-cols-2 gap-3 px-4 sm:gap-4 sm:px-6 lg:gap-3 lg:px-8 xl:px-12 ${cols}`}
      >
        {displayStats.map((stat, i) => (
          <div
            key={`${stat.label}-${i}`}
            className="glass-card rounded-xl px-2.5 py-3 text-center transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(17,76,136,0.08)] sm:px-3 sm:py-4"
          >
            <MaterialIcon
              name={stat.icon || "groups"}
              className={cn(
                "mb-1 text-2xl sm:text-[1.65rem]",
                i % 3 === 0 && "text-primary",
                i % 3 === 1 && "text-secondary",
                i % 3 === 2 && "text-tertiary",
              )}
            />
            <div className="font-heading text-lg font-semibold text-foreground sm:text-xl lg:text-[1.35rem]">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </div>
            <div
              className="mt-0.5 text-[11px] font-medium leading-snug text-muted-foreground sm:text-xs"
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

  const imageKey = slides.map((s) => s.image_url || "").join("|");

  // Prefetch every slide image so swipes feel instant
  useEffect(() => {
    preloadImages(slides.map((s) => s.image_url));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by imageKey
  }, [imageKey]);

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
      {/* Keep all backgrounds mounted so they load once and swap instantly */}
      {slides.map((slide, i) => (
        <div
          key={`bg-${i}-${slide.image_url || "gradient"}`}
          className={cn(
            "absolute inset-0 transition-opacity duration-300",
            i === index ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          aria-hidden={i !== index}
        >
          {slide.image_url ? (
            <InstantImg
              src={slide.image_url}
              alt=""
              priority={i === 0}
              className="pointer-events-none size-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-secondary/70 to-primary/40" />
          )}
        </div>
      ))}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 select-none"
          drag={slides.length > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -50) go(1);
            else if (info.offset.x > 50) go(-1);
          }}
        >
          <div className="absolute right-0 bottom-6 left-6 text-white sm:bottom-8 sm:left-8">
            <p className="font-quote hero-quote max-w-xl font-medium leading-snug">
              &ldquo;{current.quote}&rdquo;
            </p>
            {current.attribution ? (
              <p className="font-quote-attr hero-quote-attr mt-3 font-medium">
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
  projects,
}: {
  projects: CommunityRow[];
}) {
  const items =
    projects.length > 0
      ? projects
      : COMMUNITY_WORK.map((c, i) => ({
          id: `fallback-${i}`,
          slug: c.slug,
          title: c.title,
          summary: c.description,
          body: null,
          badge: c.badge,
          badge_tone: c.badgeTone,
          status: "ongoing",
          cover_image_url: null as string | null,
        }));

  return (
    <section className="relative py-16 lg:py-20" id="community">
      <div className="relative z-20 mx-auto mb-12 flex max-w-[1280px] flex-col items-start justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-end lg:px-20">
        <div className="max-w-xl">
          <h2 className="font-heading mb-3 text-3xl font-semibold">
            Our Community Initiatives
          </h2>
          <p className="text-muted-foreground">
            Empowering communities through education and service — study
            centres, mentorship, cultural programs, and collective growth.
          </p>
        </div>
        <ViewAllLink href="/community" withArrow className="rounded-lg">
          View All Work
        </ViewAllLink>
      </div>
      <div className="relative z-20 mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-4 sm:px-6 md:grid-cols-3 lg:px-20">
        {items.map((project, i) => {
          const tone = project.badge_tone || "primary";
          return (
            <HardNavLink
              key={project.id || project.slug}
              href="/community"
              className="group block"
            >
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="relative mb-4 h-64 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-tertiary/20">
                  {project.cover_image_url ? (
                    <InstantImg
                      src={project.cover_image_url}
                      alt=""
                      className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(17,181,201,0.35),transparent_55%)] transition-transform duration-500 group-hover:scale-110" />
                  )}
                  <div className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-full bg-black/25 shadow-[0_0_18px_rgba(242,178,51,0.65)] ring-1 ring-gold/50 backdrop-blur-sm">
                    <MaterialIcon
                      name="star"
                      className="text-[22px] text-gold drop-shadow-[0_0_8px_rgba(242,178,51,0.95)]"
                    />
                  </div>
                  {project.badge ? (
                    <div className="absolute top-4 left-4">
                      <span
                        className={cn(
                          "rounded-full px-4 py-1 text-xs font-semibold text-white",
                          tone === "primary" && "bg-primary",
                          tone === "secondary" && "bg-secondary",
                          tone === "tertiary" && "bg-tertiary",
                          tone !== "primary" &&
                            tone !== "secondary" &&
                            tone !== "tertiary" &&
                            "bg-primary",
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
                {project.summary ? (
                  <p className="mb-4 text-muted-foreground">{project.summary}</p>
                ) : null}
                <span className="inline-flex items-center gap-2 font-bold text-primary transition-all group-hover:gap-4">
                  Read More
                  <MaterialIcon name="arrow_right_alt" className="text-[18px]" />
                </span>
              </motion.div>
            </HardNavLink>
          );
        })}
      </div>
    </section>
  );
}

export function EventsSection({
  backgroundUrl,
  events,
}: {
  backgroundUrl?: string | null;
  events: EventRow[];
}) {
  return (
    <section
      className="relative overflow-hidden bg-[#0B1C28] py-16 text-background lg:py-20"
      id="events"
    >
      {backgroundUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={backgroundUrl}
            alt=""
            className="pointer-events-none absolute inset-0 z-0 size-full object-cover object-center"
          />
          <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/45 via-black/50 to-black/65" />
        </>
      ) : null}
      <div className="relative z-20 mx-auto mb-10 flex max-w-[1280px] flex-col items-center justify-between gap-4 px-4 sm:mb-12 sm:flex-row sm:items-end sm:px-6 lg:px-20">
        <div className="text-center sm:text-left">
          <h2 className="font-heading mb-3 text-3xl font-semibold">
            Upcoming Events
          </h2>
          <GoldHairline className="mx-auto mb-0 sm:mx-0" />
        </div>
        <ViewAllLink href="/events" dark>
          View all
        </ViewAllLink>
      </div>
      <div className="relative z-20 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-20">
        {!events.length ? (
          <p className="text-center text-white/70">
            New events will appear here once published.
          </p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const starts = new Date(event.starts_at);
              const month = starts
                .toLocaleString("en-US", { month: "short" })
                .toUpperCase();
              const day = String(starts.getDate()).padStart(2, "0");
              const tone =
                event.tone === "secondary" ? "secondary" : "primary";
              const registerHref = event.slug
                ? `/events/${encodeURIComponent(event.slug)}#register`
                : "/events";
              return (
                <div
                  key={event.id}
                  className="flex flex-col items-center gap-6 rounded-2xl border border-white/15 bg-white/10 p-6 shadow-lg backdrop-blur-[2px] transition hover:bg-white/15 md:flex-row md:gap-8"
                >
                  <div className="flex shrink-0 items-center gap-3">
                    {event.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={event.cover_image_url}
                        alt=""
                        className="size-20 rounded-xl object-cover ring-2 ring-white/20"
                      />
                    ) : null}
                    <div
                      className={cn(
                        "flex size-20 shrink-0 flex-col items-center justify-center rounded-xl text-white sm:size-24",
                        tone === "primary" ? "bg-primary" : "bg-secondary",
                      )}
                    >
                      <span className="text-xs font-semibold">{month}</span>
                      <span className="font-heading text-3xl font-bold">
                        {day}
                      </span>
                    </div>
                  </div>
                  <div className="flex-grow text-center md:text-left">
                    <h4 className="font-heading mb-2 text-xl font-semibold">
                      {event.title}
                    </h4>
                    {event.location ? (
                      <p className="flex items-center justify-center gap-2 text-white/70 md:justify-start">
                        <MaterialIcon
                          name={event.location_icon || "location_on"}
                          className="text-[18px]"
                        />
                        <span data-i18n="content">{event.location}</span>
                      </p>
                    ) : null}
                  </div>
                  <HardNavLink
                    href={registerHref}
                    className={cn(
                      "pointer-events-auto relative z-30 inline-flex min-h-11 items-center justify-center rounded-lg px-8 py-2.5 text-sm font-bold text-white transition active:scale-95",
                      tone === "primary" ? "bg-primary" : "bg-secondary",
                    )}
                  >
                    {event.registration_open ? "Register" : "View"}
                  </HardNavLink>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export function ResourcesSection({
  categories,
}: {
  categories: ResourceCategoryRow[];
}) {
  const toneClass = {
    primary: "text-primary group-hover:bg-primary group-hover:text-white",
    secondary:
      "text-secondary group-hover:bg-secondary group-hover:text-white",
    tertiary: "text-tertiary group-hover:bg-tertiary group-hover:text-white",
    brand: "text-brand group-hover:bg-brand group-hover:text-brand-foreground",
  };

  return (
    <section className="relative bg-muted py-12 sm:py-16 lg:py-20" id="resources">
      <div className="relative z-20 mx-auto mb-6 flex max-w-[1280px] items-center justify-between gap-3 px-4 sm:mb-12 sm:px-6 lg:px-20">
        <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
          Digital Library & Resources
        </h2>
        <ViewAllLink href="/resources">View all</ViewAllLink>
      </div>
      <div className="relative z-20 mx-auto grid max-w-[1280px] grid-cols-2 gap-3 px-4 sm:gap-6 sm:px-6 md:grid-cols-4 lg:px-20">
        {categories.map((item) => {
          const tone =
            item.tone in toneClass
              ? (item.tone as keyof typeof toneClass)
              : "primary";
          return (
            <HardNavLink
              key={item.slug}
              href={`/resources/${item.slug}`}
              className="glass-card group rounded-xl p-3 transition hover:-translate-y-0.5 sm:rounded-2xl sm:p-6"
            >
              <div
                className={cn(
                  "mb-2 flex aspect-[4/3] max-h-28 w-full items-center justify-center overflow-hidden rounded-lg bg-surface-highest transition-all duration-300 sm:mb-4 sm:aspect-[3/4] sm:max-h-none sm:rounded-xl",
                  !item.thumbnail_url && toneClass[tone],
                )}
              >
                {item.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.thumbnail_url}
                    alt=""
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <MaterialIcon
                    name={item.icon}
                    className="text-[36px] sm:text-[64px]"
                  />
                )}
              </div>
              <h4 className="font-heading mb-0.5 line-clamp-2 text-sm font-semibold sm:mb-1 sm:text-lg">
                {item.title}
              </h4>
              <p className="line-clamp-2 text-[11px] text-muted-foreground sm:text-sm">
                {item.subtitle}
              </p>
            </HardNavLink>
          );
        })}
      </div>
    </section>
  );
}

export function MarketplaceSection({
  books,
  purchaseMap = {},
}: {
  books: MarketplaceRow[];
  purchaseMap?: Record<string, BookPurchaseStatus>;
}) {
  return (
    <section className="overflow-hidden py-12 sm:py-16 lg:py-20">
      <div className="relative z-20 mx-auto mb-6 flex max-w-[1280px] items-center justify-between gap-3 px-4 sm:mb-12 sm:px-6 lg:px-20">
        <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
          Featured Books
        </h2>
        <ViewAllLink href="/marketplace">View all</ViewAllLink>
      </div>
      {books.length === 0 ? (
        <p className="relative z-10 mx-auto max-w-[1280px] px-4 text-center text-muted-foreground sm:px-6 lg:px-20">
          Featured books will appear here once published from the admin
          marketplace.
        </p>
      ) : (
        <div className="relative z-10 mx-auto grid max-w-[1280px] grid-cols-1 gap-3 px-4 sm:grid-cols-2 sm:gap-6 sm:px-6 md:grid-cols-3 lg:px-20">
          {books.map((book) => (
            <div
              key={book.id}
              className="rounded-xl border border-border/40 bg-white p-4 transition hover:shadow-2xl sm:rounded-2xl sm:p-8"
            >
              <Link href={`/marketplace/${book.slug}`} className="block">
                <div className="mb-3 flex h-36 items-center justify-center overflow-hidden rounded-lg bg-surface-highest sm:mb-4 sm:h-72 sm:rounded-xl">
                  {book.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.cover_image_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <MaterialIcon
                      name="menu_book"
                      className="text-4xl text-primary/40 sm:text-6xl"
                    />
                  )}
                </div>
                <h4 className="font-heading text-base font-semibold sm:text-xl">
                  {book.title}
                </h4>
                <p className="mt-1 text-[11px] text-muted-foreground sm:mt-2 sm:text-xs">
                  ({book.review_count} Reviews)
                </p>
              </Link>
              <div className="mt-3 flex items-center justify-between gap-2 sm:mt-6">
                <span className="font-heading text-lg font-semibold text-primary sm:text-2xl">
                  {book.price_label}
                </span>
                <BookBuyButton
                  bookId={book.id}
                  bookSlug={book.slug}
                  title={book.title}
                  priceLabel={book.price_label}
                  status={purchaseMap[book.id] || null}
                  size="sm"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function MustReadSection({
  books,
}: {
  books: Array<{
    id: string;
    title: string;
    author: string | null;
    summary: string | null;
    cover_image_url: string | null;
    pdf_url: string;
  }>;
}) {
  return (
    <section className="bg-surface-low/60 py-12 sm:py-16 lg:py-20" id="must-read">
      <div className="relative z-20 mx-auto mb-6 flex max-w-[1280px] flex-col items-start justify-between gap-4 px-4 sm:mb-12 sm:flex-row sm:items-end sm:px-6 lg:px-20">
        <div className="max-w-xl">
          <p className="mb-2 text-sm font-semibold tracking-wide text-primary uppercase">
            Essential reading
          </p>
          <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
            Books You Must Read
          </h2>
          <p className="mt-2 text-muted-foreground">
            Curated titles with free PDF access — tap ? for details, or Read PDF
            to open the book.
          </p>
        </div>
        <ViewAllLink href="/must-read">View all</ViewAllLink>
      </div>
      {!books.length ? (
        <p className="relative z-10 mx-auto max-w-[1280px] px-4 text-sm text-muted-foreground sm:px-6 lg:px-20">
          Books will appear here once published.{" "}
          <Link href="/must-read" className="font-semibold text-primary underline">
            Open Must Read
          </Link>
        </p>
      ) : (
        <div className="relative z-10 mx-auto grid max-w-[1280px] grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:gap-6 sm:px-6 md:grid-cols-3 lg:px-20">
          {books.slice(0, 6).map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <MustReadBookCard book={book} />
            </motion.div>
          ))}
        </div>
      )}
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
