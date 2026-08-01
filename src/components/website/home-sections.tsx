"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { COMMUNITY_WORK, CORE_VALUES, STATS } from "@/lib/constants";
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
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function AboutSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
      <div className="max-w-2xl">
        <p className="font-heading text-sm font-medium tracking-[0.18em] text-primary uppercase">
          Who We Are
        </p>
        <h2 className="mt-3 font-heading text-3xl font-semibold text-foreground sm:text-4xl">
          Building a platform for dignity, learning, and collective progress.
        </h2>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
          Brass Foundation exists to advance Ambedkarite values through
          education, community service, and leadership development — with
          professionalism that matches our purpose.
        </p>
      </div>

      <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {CORE_VALUES.map((value, i) => (
          <motion.div
            key={value.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <p className="font-heading text-lg font-semibold text-secondary">
              {value.title}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {value.description}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-10">
        <Link
          href="/about"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "rounded-2xl",
          )}
        >
          Read More
        </Link>
      </div>
    </section>
  );
}

export function StatsSection() {
  return (
    <section className="bg-secondary py-20 text-secondary-foreground">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 sm:grid-cols-3 lg:grid-cols-6 lg:px-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-heading text-3xl font-semibold text-brand sm:text-4xl">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="mt-2 text-xs tracking-wide text-white/65 uppercase">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CommunitySection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
      <div className="max-w-2xl">
        <p className="font-heading text-sm font-medium tracking-[0.18em] text-primary uppercase">
          Community Work
        </p>
        <h2 className="mt-3 font-heading text-3xl font-semibold sm:text-4xl">
          Service that strengthens society.
        </h2>
        <p className="mt-4 text-muted-foreground">
          From classrooms to camps, our programs turn solidarity into measurable
          impact.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {COMMUNITY_WORK.map((item, i) => (
          <motion.div
            key={item.slug}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.05 }}
            className="rounded-2xl bg-card p-6 shadow-soft"
          >
            <p className="font-heading font-medium text-foreground">
              {item.title}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function MembershipCta() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 lg:px-8">
      <div className="rounded-2xl bg-primary px-8 py-14 text-primary-foreground sm:px-12">
        <h2 className="font-heading max-w-xl text-3xl font-semibold sm:text-4xl">
          Join Brass Foundation.
        </h2>
        <p className="mt-4 max-w-lg text-primary-foreground/85">
          Register online, receive your digital membership card, and take part
          in programs that advance education and equality.
        </p>
        <Link
          href="/membership"
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-8 inline-flex rounded-2xl bg-gold px-5 text-gold-foreground hover:bg-gold/90",
          )}
        >
          Start Registration
        </Link>
      </div>
    </section>
  );
}
