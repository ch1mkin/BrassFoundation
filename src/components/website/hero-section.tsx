"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
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
  floatingStats?: Array<{ label: string; value: number; suffix?: string }>;
};

export function HeroSection({
  headline,
  subheadline,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  floatingStats,
}: HeroSectionProps) {
  const lines = headline.split("\n").filter(Boolean);
  const left = floatingStats?.[0];
  const right = floatingStats?.[1];

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-surface pt-20">
      <HeroParticles />

      <div className="relative z-10 mx-auto max-w-[1280px] px-4 py-16 text-center sm:px-6 lg:px-20">
        <div className="mb-12 flex justify-center">
          <div className="relative">
            <motion.div
              className="floating-animation"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
            >
              <Image
                src="/brand/logo.png"
                alt="Brass Foundation"
                width={192}
                height={192}
                priority
                className="h-40 w-40 object-contain drop-shadow-2xl sm:h-48 sm:w-48"
              />
            </motion.div>

            {left ? (
              <div
                className="glass-card absolute -top-8 -left-16 hidden rounded-xl p-3 animate-bounce sm:block"
                style={{ animationDuration: "4s" }}
              >
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
              <div
                className="glass-card absolute top-16 -right-20 hidden rounded-xl p-3 animate-bounce sm:block"
                style={{ animationDuration: "5s" }}
              >
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
          className="font-heading mx-auto mb-6 max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[48px] lg:leading-[1.1]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
        >
          {lines.map((line, i) => (
            <span key={line} className="block">
              {i === lines.length - 1 ? (
                <span className="text-primary">{line}</span>
              ) : (
                line
              )}
            </span>
          ))}
        </motion.h1>

        <motion.p
          className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {subheadline}
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
            {primaryLabel}
            <span className="material-symbols-outlined text-[20px]">
              person_add
            </span>
          </Link>
          <Link
            href={secondaryHref}
            className={cn(
              buttonVariants({ variant: "secondary", size: "lg" }),
              "h-14 rounded-lg bg-surface-highest px-8 text-base font-bold text-primary hover:bg-surface-high",
            )}
          >
            {secondaryLabel}
            <span className="material-symbols-outlined text-[20px]">
              auto_stories
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
