"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { PenNibLogo } from "@/components/website/pen-nib-logo";
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
};

export function HeroSection({
  eyebrow,
  headline,
  subheadline,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: HeroSectionProps) {
  const lines = headline.split("\n");

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-[#0B1C28]">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 72% 38%, rgba(31,111,120,0.35) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 18% 82%, rgba(22,58,95,0.55) 0%, transparent 50%), linear-gradient(160deg, #0B1C28 0%, #163A5F 100%)",
        }}
      />
      <HeroParticles />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-24 pb-20 lg:px-8">
        <div className="glass max-w-2xl rounded-2xl p-8 sm:p-10">
          <PenNibLogo className="mb-6 size-14 text-brand" />

          <motion.p
            className="font-heading text-sm font-medium tracking-[0.22em] text-brand uppercase"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {eyebrow}
          </motion.p>

          <motion.h1
            className="mt-4 font-heading text-4xl font-medium tracking-tight text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.12]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
          >
            {lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </motion.h1>

          <motion.p
            className="mt-5 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            {subheadline}
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
          >
            <Link
              href={primaryHref}
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-2xl bg-gold px-5 text-gold-foreground hover:bg-gold/90",
              )}
            >
              {primaryLabel}
            </Link>
            <Link
              href={secondaryHref}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-2xl border-white/25 bg-transparent px-5 text-white hover:bg-white/10 hover:text-white",
              )}
            >
              {secondaryLabel}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
