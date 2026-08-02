"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { MembershipLink } from "@/components/membership/membership-link";
import { useLocale } from "@/components/i18n/locale-provider";
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
  headlinePa?: string | null;
  subheadlinePa?: string | null;
  primaryLabelPa?: string | null;
  secondaryLabelPa?: string | null;
};

export function HeroSection({
  headline,
  subheadline,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  backgroundUrl,
  backgroundMobileUrl,
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
  const hasBg = Boolean(desktopBg || mobileBg);
  const adminPa = Boolean(
    locale === "pa" && (headlinePa?.trim() || subheadlinePa?.trim()),
  );
  const joinHref =
    /membership|member|join|register/i.test(primaryHref) ||
    /member|join/i.test(displayPrimary)
      ? "/membership"
      : primaryHref;

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-surface pt-20">
      {hasBg ? (
        <>
          {/* Mobile: full-bleed cover across the hero viewport */}
          {mobileBg ? (
            <div className="pointer-events-none absolute inset-0 md:hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mobileBg}
                alt=""
                className="h-full w-full object-cover object-center"
              />
              {/* Soft vignette only at the very bottom so the photo stays nearly full */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface/80 to-transparent" />
            </div>
          ) : null}

          {/* Desktop: edge-to-edge cover */}
          {desktopBg ? (
            <div className="pointer-events-none absolute inset-0 hidden md:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={desktopBg}
                alt=""
                className="h-full w-full object-cover object-center"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-surface/80 to-transparent" />
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
            className="flex size-40 items-center justify-center rounded-full bg-white p-3 shadow-lg ring-1 ring-black/5 sm:size-52 sm:p-4"
          >
            <Image
              src="/brand/logo.png"
              alt="Brass Foundation"
              width={192}
              height={192}
              priority
              className="h-full w-full object-contain drop-shadow-xl"
            />
          </motion.div>
        </div>

        <motion.h1
          className={cn(
            "font-heading mx-auto mb-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-[48px] lg:leading-[1.1]",
            hasBg ? "hero-headline text-white" : "text-foreground",
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

        <motion.p
          className={cn(
            "mx-auto mb-10 max-w-2xl text-lg leading-relaxed",
            hasBg ? "text-white" : "text-muted-foreground",
            adminPa && "notranslate",
          )}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          lang={adminPa ? "pa" : undefined}
        >
          {displaySub}
        </motion.p>

        <motion.div
          className="flex flex-col justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
        >
          {joinHref === "/membership" ? (
            <MembershipLink
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-14 rounded-lg bg-primary px-8 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90",
              )}
            >
              {displayPrimary}
              <MaterialIcon name="person_add" className="text-[20px]" />
            </MembershipLink>
          ) : (
            <a
              href={joinHref}
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-14 rounded-lg bg-primary px-8 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90",
              )}
            >
              {displayPrimary}
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
