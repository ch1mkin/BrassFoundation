"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function GoldenLeaf({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-gold", className)}
      aria-hidden
    >
      <path
        d="M32 4C32 4 8 28 8 52c0 16 10.5 28 24 40 13.5-12 24-24 24-40C56 28 32 4 32 4Z"
        fill="currentColor"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.55"
      />
      <path
        d="M32 14v68M32 28c-8 6-12 14-12 24M32 28c8 6 12 14 12 24M32 48c-6 4-9 10-9 16M32 48c6 4 9 10 9 16"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeOpacity="0.45"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Soft golden leaf flourishes that fade in when a section enters view. */
export function SectionOrnaments({
  className,
  density = "default",
}: {
  className?: string;
  density?: "default" | "rich";
}) {
  const extras = density === "rich";

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <motion.div
        initial={{ opacity: 0, x: -12, rotate: -8 }}
        whileInView={{ opacity: 1, x: 0, rotate: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -top-2 -left-1 sm:top-4 sm:left-2"
      >
        <GoldenLeaf className="h-16 w-11 sm:h-24 sm:w-16" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 12, rotate: 10 }}
        whileInView={{ opacity: 1, x: 0, rotate: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -top-1 -right-1 sm:top-6 sm:right-3"
      >
        <GoldenLeaf className="h-14 w-10 scale-x-[-1] sm:h-20 sm:w-14" />
      </motion.div>
      {extras ? (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 0.7, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute bottom-4 left-[8%] hidden sm:block"
          >
            <GoldenLeaf className="h-12 w-8 rotate-[-25deg] opacity-70" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 0.7, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.28 }}
            className="absolute right-[10%] bottom-6 hidden sm:block"
          >
            <GoldenLeaf className="h-12 w-8 scale-x-[-1] rotate-[20deg] opacity-70" />
          </motion.div>
        </>
      ) : null}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent" />
    </div>
  );
}

export function GoldHairline({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "mx-auto h-px w-24 bg-gradient-to-r from-transparent via-gold/60 to-transparent",
        className,
      )}
      aria-hidden
    />
  );
}
