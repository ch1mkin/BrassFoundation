"use client";

import { useId, useMemo } from "react";
import { cn } from "@/lib/utils";

function GoldenLeaf({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const fillId = `leafFill-${uid}`;
  const edgeId = `leafEdge-${uid}`;

  return (
    <svg
      viewBox="0 0 48 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("drop-shadow-sm", className)}
      aria-hidden
    >
      <defs>
        <linearGradient
          id={fillId}
          x1="8"
          y1="4"
          x2="40"
          y2="68"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#F5D78A" />
          <stop offset="40%" stopColor="#D69A17" />
          <stop offset="100%" stopColor="#8B5A00" />
        </linearGradient>
        <linearGradient
          id={edgeId}
          x1="24"
          y1="0"
          x2="24"
          y2="72"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFE9B0" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#A86B00" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <path
        d="M24 3C24 3 5 22 5 42c0 12 8 22 19 28 11-6 19-16 19-28C43 22 24 3 24 3Z"
        fill={`url(#${fillId})`}
        stroke={`url(#${edgeId})`}
        strokeWidth="1.2"
      />
      <path
        d="M24 10v52M24 22c-6 5-9 11-9 18M24 22c6 5 9 11 9 18M24 38c-4.5 3-7 8-7 13M24 38c4.5 3 7 8 7 13"
        stroke="#5C3A00"
        strokeOpacity="0.35"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <ellipse
        cx="18"
        cy="28"
        rx="4"
        ry="7"
        fill="#FFE9B0"
        fillOpacity="0.28"
        transform="rotate(-25 18 28)"
      />
    </svg>
  );
}

type LeafSpec = {
  id: number;
  left: string;
  size: number;
  delay: number;
  duration: number;
  sway: number;
  flip: boolean;
  startTop: number;
};

function buildLeaves(count: number, seed: number): LeafSpec[] {
  // Deterministic layout so SSR/client match — spaced across the section
  const leaves: LeafSpec[] = [];
  for (let i = 0; i < count; i++) {
    const slot = count === 1 ? 50 : 12 + (i / (count - 1)) * 76;
    leaves.push({
      id: i,
      left: `${slot + ((seed + i) % 3) - 1}%`,
      size: 22 + ((i * 5 + seed) % 10),
      delay: i * 2.4 + seed * 0.4,
      duration: 10 + ((i * 2 + seed) % 4),
      sway: 14 + ((i * 9) % 18),
      flip: i % 2 === 0,
      startTop: -6 - (i % 3) * 4,
    });
  }
  return leaves;
}

/** Sparse golden leaves that drift downward and fade out. */
export function SectionOrnaments({
  className,
  density = "default",
}: {
  className?: string;
  density?: "default" | "rich";
}) {
  // Keep leaf count modest so the section stays elegant
  const count = density === "rich" ? 6 : 5;
  const leaves = useMemo(
    () => buildLeaves(count, density === "rich" ? 2 : 1),
    [count, density],
  );

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden opacity-55",
        className,
      )}
      aria-hidden
    >
      {leaves.map((leaf) => (
        <span
          key={leaf.id}
          className="golden-leaf-fall absolute"
          style={
            {
              left: leaf.left,
              top: `${leaf.startTop}%`,
              width: leaf.size,
              height: leaf.size * 1.45,
              animationDelay: `${leaf.delay}s`,
              animationDuration: `${leaf.duration}s`,
              ["--leaf-sway" as string]: `${leaf.sway}px`,
              ["--leaf-spin" as string]: leaf.flip ? "140deg" : "-160deg",
            } as React.CSSProperties
          }
        >
          <GoldenLeaf
            className={cn("h-full w-full", leaf.flip && "scale-x-[-1]")}
          />
        </span>
      ))}
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

/** Shared shiny gold CTA class name for Become a Member buttons. */
export const GOLD_SHINY_BTN =
  "gold-shiny-btn inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-bold text-white sm:h-14 sm:px-8 sm:text-base";
