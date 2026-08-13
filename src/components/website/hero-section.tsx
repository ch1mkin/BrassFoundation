"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { MembershipLink } from "@/components/membership/membership-link";
import { useLocale } from "@/components/i18n/locale-provider";
import { GOLD_SHINY_BTN } from "@/components/website/premium-accents";
import { InstantImg } from "@/components/website/instant-img";
import { SITE } from "@/lib/constants";
import { cdnMediaUrl } from "@/lib/media/cdn";
import {
  DEFAULT_HERO_FRAME,
  heroFrameStyle,
  type HeroImageFrame,
} from "@/lib/cms/hero-frame";
import { cn } from "@/lib/utils";

const HeroParticles = dynamic(
  () =>
    import("@/components/website/hero-particles").then((m) => m.HeroParticles),
  { ssr: false },
);

type HeroSectionProps = {
  eyebrow: string;
  headline: string;
  subheadline: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  backgroundUrl?: string | null;
  backgroundMobileUrl?: string | null;
  backgroundFrame?: HeroImageFrame | null;
  backgroundMobileFrame?: HeroImageFrame | null;
  headlinePa?: string | null;
  subheadlinePa?: string | null;
  primaryLabelPa?: string | null;
  secondaryLabelPa?: string | null;
};

function HeroLogoWithSlogan({ hasBg }: { hasBg: boolean }) {
  const ring = 220;
  const cx = ring / 2;
  const cy = ring / 2;
  const r = ring / 2 - 14;
  const pathId = "hero-logo-slogan-path";
  // Fixed top-arc curved heading (not rotating)
  const arcStartX = cx - r;
  const arcEndX = cx + r;
  const arcY = cy;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: ring, height: ring }}
    >
      <svg
        width={ring}
        height={ring}
        viewBox={`0 0 ${ring} ${ring}`}
        className={cn(
          "pointer-events-none absolute inset-0 size-full",
          hasBg ? "text-white" : "text-foreground/80",
        )}
        aria-hidden
      >
        <defs>
          <path
            id={pathId}
            d={`M ${arcStartX},${arcY} A ${r},${r} 0 0,1 ${arcEndX},${arcY}`}
            fill="none"
          />
        </defs>
        <text
          className={cn(
            "uppercase",
            hasBg ? "hero-slogan-arc" : "fill-current",
          )}
          style={{
            fontSize: 16,
            letterSpacing: "0.16em",
            fontWeight: 700,
          }}
        >
          <textPath
            href={`#${pathId}`}
            startOffset="50%"
            textAnchor="middle"
          >
            {SITE.slogan}
          </textPath>
        </text>
      </svg>

      <div className="relative z-[1] flex size-36 items-center justify-center rounded-full bg-white p-3 shadow-lg ring-1 ring-black/5 sm:size-44 sm:p-4">
        <Image
          src="/brand/logo.png"
          alt="BRASS Foundation"
          width={176}
          height={176}
          priority
          className="h-full w-full object-contain drop-shadow-xl"
        />
      </div>
      <span className="sr-only">{SITE.slogan}</span>
    </div>
  );
}

function isSloganOnly(text: string | null | undefined) {
  if (!text) return true;
  const normalized = text
    .trim()
    .toLowerCase()
    .replace(/[·•.]/g, " ")
    .replace(/\s+/g, " ");
  const slogan = SITE.slogan.toLowerCase();
  return (
    !normalized ||
    normalized === slogan ||
    normalized === `${slogan}.` ||
    normalized.replace(/\s/g, "") === slogan.replace(/\s/g, "")
  );
}

export function HeroSection({
  headline,
  subheadline,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  backgroundUrl,
  backgroundMobileUrl,
  backgroundFrame,
  backgroundMobileFrame,
  headlinePa,
  subheadlinePa,
  primaryLabelPa,
  secondaryLabelPa,
}: HeroSectionProps) {
  const { locale } = useLocale();
  const displayHeadline =
    locale === "pa" && headlinePa?.trim() ? headlinePa : headline;
  const displaySub =
    locale === "pa" && subheadlinePa?.trim() ? subheadlinePa : subheadline;
  const displayPrimary =
    locale === "pa" && primaryLabelPa?.trim() ? primaryLabelPa : primaryLabel;
  const displaySecondary =
    locale === "pa" && secondaryLabelPa?.trim()
      ? secondaryLabelPa
      : secondaryLabel;
  const lines = displayHeadline.split("\n").filter(Boolean);
  const desktopBg = backgroundUrl?.trim() || null;
  const mobileBg = backgroundMobileUrl?.trim() || desktopBg;
  const desktopFrame = backgroundFrame || DEFAULT_HERO_FRAME;
  const mobileFrame = backgroundMobileFrame || DEFAULT_HERO_FRAME;
  const hasBg = Boolean(desktopBg || mobileBg);
  const adminPa = Boolean(
    locale === "pa" && (headlinePa?.trim() || subheadlinePa?.trim()),
  );
  const joinHref =
    /membership|member|join|register/i.test(primaryHref) ||
    /member|join/i.test(displayPrimary)
      ? "/membership"
      : primaryHref;
  // Slogan lives on the curved logo heading — hide duplicate headline/sub lines
  const showHeadline = !isSloganOnly(displayHeadline);
  const showSubheadline = !isSloganOnly(displaySub);

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-surface pt-20">
      {hasBg ? (
        <>
          {/* Media-query preloads: only the viewport-matching hero starts early. */}
          {mobileBg ? (
            <link
              rel="preload"
              as="image"
              href={cdnMediaUrl(mobileBg)}
              media="(max-width: 767.98px)"
              fetchPriority="high"
            />
          ) : null}
          {desktopBg ? (
            <link
              rel="preload"
              as="image"
              href={cdnMediaUrl(desktopBg)}
              media="(min-width: 768px)"
              fetchPriority="high"
            />
          ) : null}

          {mobileBg ? (
            <div className="pointer-events-none absolute inset-0 overflow-hidden md:hidden">
              <InstantImg
                src={mobileBg}
                alt=""
                // When both heroes exist, rely on media-query preload so desktop
                // does not also download the mobile file (and vice versa).
                loading={desktopBg ? "lazy" : "eager"}
                fetchPriority="high"
                priority={!desktopBg}
                className="h-full w-full object-cover"
                style={heroFrameStyle(mobileFrame)}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-surface/80" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,28,58,0.15)_0%,rgba(0,28,58,0.45)_70%)]" />
            </div>
          ) : null}

          {desktopBg ? (
            <div className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block">
              <InstantImg
                src={desktopBg}
                alt=""
                loading={mobileBg ? "lazy" : "eager"}
                fetchPriority="high"
                priority={!mobileBg}
                className="h-full w-full object-cover"
                style={heroFrameStyle(desktopFrame)}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-surface/80" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,28,58,0.12)_0%,rgba(0,28,58,0.4)_72%)]" />
            </div>
          ) : null}
        </>
      ) : (
        <HeroParticles />
      )}

      <div className="relative z-10 mx-auto max-w-[1280px] px-4 py-16 text-center sm:px-6 lg:px-20">
        <div className="mb-10 flex justify-center sm:mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55 }}
          >
            <HeroLogoWithSlogan hasBg={hasBg} />
          </motion.div>
        </div>

        {showHeadline ? (
          <motion.h1
            className={cn(
              "font-heading mx-auto mb-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-[48px] lg:leading-[1.1]",
              hasBg ? "hero-headline" : "text-foreground",
              adminPa && "notranslate",
            )}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            lang={adminPa ? "pa" : undefined}
          >
            {lines.map((line) => (
              <span key={line} className="block text-inherit">
                {line}
              </span>
            ))}
          </motion.h1>
        ) : (
          /* Same footprint as the slogan headline on mobile; collapse on md+ */
          <p
            className="font-heading invisible mx-auto mb-6 max-w-4xl select-none text-4xl font-bold tracking-tight sm:text-5xl md:hidden"
            aria-hidden
          >
            {SITE.slogan}.
          </p>
        )}

        {showSubheadline ? (
          <motion.p
            className={cn(
              "mx-auto mb-10 max-w-2xl text-lg leading-relaxed",
              hasBg ? "hero-subheadline" : "text-muted-foreground",
              adminPa && "notranslate",
            )}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            lang={adminPa ? "pa" : undefined}
          >
            {displaySub}
          </motion.p>
        ) : (
          <div className="mb-10 md:mb-10" aria-hidden />
        )}

        <motion.div
          className="flex flex-col justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
        >
          {joinHref === "/membership" ||
          /membership|member|join|register/i.test(primaryHref) ? (
            <MembershipLink
              href="/membership"
              className={cn(GOLD_SHINY_BTN, "w-full shadow-lg sm:w-auto")}
            >
              <span>{displayPrimary}</span>
              <MaterialIcon name="person_add" className="text-[20px]" />
            </MembershipLink>
          ) : (
            <a
              href={joinHref}
              className={cn(GOLD_SHINY_BTN, "w-full shadow-lg sm:w-auto")}
            >
              <span>{displayPrimary}</span>
              <MaterialIcon name="person_add" className="text-[20px]" />
            </a>
          )}
          <a
            href={secondaryHref}
            className={cn(
              buttonVariants({ variant: "secondary", size: "lg" }),
              "h-14 rounded-lg bg-white px-8 text-base font-bold text-primary hover:bg-white/90",
            )}
          >
            {displaySecondary}
            <MaterialIcon name="auto_stories" className="text-[20px]" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
