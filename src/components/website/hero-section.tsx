"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
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
  floatingStats?: Array<{ label: string; value: number; suffix?: string }>;
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
  floatingStats,
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
  const left = floatingStats?.[0];
  const right = floatingStats?.[1];
  const desktopBg = backgroundUrl?.trim() || null;
  const mobileBg =
    backgroundMobileUrl?.trim() || desktopBg;
  const hasBg = Boolean(desktopBg || mobileBg);
  const adminPa = Boolean(
    locale === "pa" &&
      (headlinePa?.trim() || subheadlinePa?.trim()),
  );

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-surface pt-20">
      {hasBg ? (
        <>
          {/* Mobile: contain + center so the full image width stays visible */}
          {mobileBg ? (
            <div className="absolute inset-0 bg-[#0B1C28] md:hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mobileBg}
                alt=""
                className="absolute top-1/2 left-1/2 h-auto max-h-[58svh] w-[min(100%,24rem)] -translate-x-1/2 -translate-y-[58%] object-contain object-center sm:w-[min(92%,28rem)] sm:max-h-[62svh]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#001c3a]/55 via-[#004f58]/35 to-surface" />
            </div>
          ) : null}

          {/* Desktop: edge-to-edge cover */}
          {desktopBg ? (
            <div className="absolute inset-0 hidden md:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={desktopBg}
                alt=""
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#001c3a]/75 via-[#004f58]/55 to-surface" />
            </div>
          ) : null}
        </>
      ) : (
        <HeroParticles />
      )}

      <div className="relative z-10 mx-auto max-w-[1280px] px-4 py-16 text-center sm:px-6 lg:px-20">
        <div className="mb-10 flex justify-center sm:mb-12">
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55 }}
            >
              <Image
                src="/brand/logo.png"
                alt="Brass Foundation"
                width={192}
                height={192}
                priority
                className="h-36 w-36 rounded-full bg-white/95 object-contain p-2 drop-shadow-2xl sm:h-48 sm:w-48"
              />
            </motion.div>

            {left ? (
              <div className="glass-card absolute -top-8 -left-16 hidden rounded-xl p-3 sm:block">
                <span className="font-heading block text-xl font-semibold text-primary">
                  {left.value.toLocaleString()}
                  {left.suffix || ""}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {left.label}
                </span>
              </div>
            ) : null}
            {right ? (
              <div className="glass-card absolute top-16 -right-20 hidden rounded-xl p-3 sm:block">
                <span className="font-heading block text-xl font-semibold text-secondary">
                  {right.value.toLocaleString()}
                  {right.suffix || ""}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {right.label}
                </span>
              </div>
            ) : null}
          </div>
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
          {lines.map((line, i) => (
            <span key={line} className="block">
              {i === lines.length - 1 ? (
                <span
                  className={cn(
                    hasBg ? "hero-headline-accent text-brand" : "text-primary",
                  )}
                >
                  {line}
                </span>
              ) : (
                line
              )}
            </span>
          ))}
        </motion.h1>

        <motion.p
          className={cn(
            "mx-auto mb-10 max-w-2xl text-lg leading-relaxed",
            hasBg ? "text-white/85" : "text-muted-foreground",
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
          <Link
            href={primaryHref}
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-14 rounded-lg bg-primary px-8 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90",
            )}
          >
            {displayPrimary}
            <MaterialIcon name="person_add" className="text-[20px]" />
          </Link>
          <Link
            href={secondaryHref}
            className={cn(
              buttonVariants({ variant: "secondary", size: "lg" }),
              "h-14 rounded-lg bg-white px-8 text-base font-bold text-primary hover:bg-white/90",
            )}
          >
            {displaySecondary}
            <MaterialIcon name="auto_stories" className="text-[20px]" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
