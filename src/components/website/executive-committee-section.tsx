"use client";

import { motion } from "framer-motion";
import type { ExecutiveMember } from "@/lib/content/committee";
import { buttonVariants } from "@/components/ui/button";
import {
  GoldHairline,
  SectionOrnaments,
} from "@/components/website/premium-accents";
import { InstantImg, preloadImages } from "@/components/website/instant-img";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

function initialsFor(name: string) {
  return name
    .replace(/^Sh\.\s*/i, "")
    .replace(/^Adv\.\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function MemberTile({
  member,
  size,
  priority = false,
}: {
  member: ExecutiveMember;
  size: "lg" | "md" | "sm";
  priority?: boolean;
}) {
  const photo =
    size === "lg"
      ? "size-24 sm:size-32 md:size-40"
      : size === "md"
        ? "size-16 sm:size-20 md:size-24"
        : "size-12 sm:size-16 md:size-20";
  const title =
    size === "lg"
      ? "text-sm sm:text-lg md:text-xl"
      : size === "md"
        ? "text-[11px] sm:text-sm"
        : "text-[10px] sm:text-xs";
  const role =
    size === "lg"
      ? "text-xs sm:text-sm md:text-base"
      : size === "md"
        ? "text-[10px] sm:text-xs"
        : "text-[9px] sm:text-[10px]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex min-w-0 max-w-full flex-col items-center text-center"
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-surface-highest shadow-md sm:border-4",
          photo,
        )}
      >
        {member.photo_url ? (
          <InstantImg
            src={member.photo_url}
            alt={member.full_name}
            priority={priority}
            className="size-full object-cover"
          />
        ) : (
          <span
            className={cn(
              "font-heading font-bold text-primary/45",
              size === "lg" ? "text-xl sm:text-3xl" : "text-xs sm:text-base",
            )}
          >
            {initialsFor(member.full_name) || "—"}
          </span>
        )}
      </div>
      <h3
        className={cn(
          "font-heading mt-1.5 line-clamp-2 font-semibold leading-tight text-foreground sm:mt-2",
          title,
        )}
      >
        {member.full_name}
      </h3>
      <p className={cn("mt-0.5 line-clamp-2 font-medium text-primary", role)}>
        {member.role_title}
      </p>
    </motion.div>
  );
}

function isChair(role: string) {
  return /^chairman$/i.test(role.trim());
}
function isVice(role: string) {
  return /vice\s*chairman/i.test(role.trim());
}
function isGeneralSecretary(role: string) {
  return /general\s*secretary/i.test(role.trim());
}
function isTreasurer(role: string) {
  return /^treasurer$/i.test(role.trim());
}
function isOfficerRow(role: string) {
  return isVice(role) || isGeneralSecretary(role) || isTreasurer(role);
}

/**
 * Build widening pyramid row sizes that sum to n.
 * Never leaves a lone person on a row (unless n === 1).
 * Last row is always the widest — flat base.
 */
function pyramidRowSizes(n: number): number[] {
  if (n <= 0) return [];
  if (n === 1) return [1];
  if (n <= 4) return [n];

  for (let top = Math.floor((n - 1) / 2); top >= 2; top--) {
    const base = n - top;
    if (base >= top && base >= 2) return [top, base];
  }

  for (let base = Math.ceil(n / 2); base <= n - 4; base++) {
    const rem = n - base;
    for (let mid = Math.min(base - 1, rem - 2); mid >= 2; mid--) {
      const top = rem - mid;
      if (top >= 2 && top <= mid) return [top, mid, base];
    }
  }

  const rows: number[] = [];
  let left = n;
  while (left > 0) {
    if (left === 3) {
      rows.push(3);
      break;
    }
    if (left === 1 && rows.length) {
      rows[rows.length - 1] += 1;
      break;
    }
    const take = Math.min(4, left === 5 ? 3 : left);
    rows.push(take);
    left -= take;
  }
  return rows;
}

function splitIntoRows<T>(items: T[], sizes: number[]): T[][] {
  const rows: T[][] = [];
  let i = 0;
  for (const size of sizes) {
    rows.push(items.slice(i, i + size));
    i += size;
  }
  return rows;
}

const ROW_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  7: "grid-cols-7",
  8: "grid-cols-4 sm:grid-cols-8",
};

/**
 * Pyramid: Chairman alone → Vice / General Secretary / Treasurer → flat base of the rest.
 */
export function LeadershipSection({
  members,
  viewAllHref = "/about#executive-committee",
  showViewAll = true,
}: {
  members: ExecutiveMember[];
  viewAllHref?: string;
  showViewAll?: boolean;
}) {
  const chair = members.find((m) => isChair(m.role_title));
  const vice = members.find((m) => isVice(m.role_title));
  const generalSecretary = members.find((m) =>
    isGeneralSecretary(m.role_title),
  );
  const treasurer = members.find((m) => isTreasurer(m.role_title));
  const officers = [vice, generalSecretary, treasurer].filter(
    Boolean,
  ) as ExecutiveMember[];
  const rest = members.filter(
    (m) => !isChair(m.role_title) && !isOfficerRow(m.role_title),
  );

  const sizes = pyramidRowSizes(rest.length);
  const rows = splitIntoRows(rest, sizes);

  const photoKey = members.map((m) => m.photo_url || "").join("|");

  useEffect(() => {
    preloadImages(members.map((m) => m.photo_url));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by photoKey
  }, [photoKey]);

  return (
    <section
      id="executive-committee"
      className="relative overflow-hidden bg-surface-high py-10 sm:py-14 lg:py-16"
    >
      <SectionOrnaments />
      <div className="relative z-20 mx-auto mb-8 flex max-w-[1280px] flex-col items-center justify-between gap-4 px-4 text-center sm:mb-10 sm:flex-row sm:items-end sm:px-6 sm:text-left lg:px-20">
        <div>
          <h2 className="font-heading mb-2 text-2xl font-semibold sm:text-3xl">
            Executive Committee
          </h2>
          <GoldHairline className="mx-auto mb-3 mt-3 sm:mx-0" />
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:mx-0 sm:text-base">
            The committee guiding Brass Foundation&apos;s mission of education,
            equality, and community development.
          </p>
        </div>
        {showViewAll ? (
          // eslint-disable-next-line @next/next/no-html-link-for-pages -- hard nav for mobile taps
          <a
            href={viewAllHref}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "pointer-events-auto relative z-40 inline-flex min-h-11 shrink-0 touch-manipulation items-center justify-center rounded-full px-4 text-sm sm:min-h-10 sm:px-4",
            )}
          >
            View all
          </a>
        ) : null}
      </div>

      <div className="relative z-10 mx-auto flex max-w-[1280px] flex-col items-stretch gap-6 px-2 sm:gap-8 sm:px-6 lg:gap-10 lg:px-20">
        {chair ? (
          <div className="mx-auto grid w-full max-w-xs grid-cols-1 justify-items-center">
            <MemberTile member={chair} size="lg" priority />
          </div>
        ) : null}

        {officers.length > 0 ? (
          <div
            className={cn(
              "mx-auto grid w-full max-w-3xl justify-items-center gap-3 sm:gap-8",
              officers.length === 1
                ? "grid-cols-1"
                : officers.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-3",
            )}
          >
            {officers.map((m) => (
              <MemberTile key={m.id} member={m} size="md" priority />
            ))}
          </div>
        ) : null}

        {rows.map((row, rowIndex) => {
          const isBase = rowIndex === rows.length - 1;
          const size = isBase && rows.length > 1 ? "sm" : "md";
          return (
            <div
              key={`row-${rowIndex}`}
              className={cn(
                "mx-auto grid w-full justify-items-center gap-x-1 gap-y-4 sm:gap-x-4 sm:gap-y-6",
                isBase ? "max-w-5xl" : "max-w-3xl",
                ROW_COLS[row.length] || "grid-cols-3",
              )}
            >
              {row.map((m) => (
                <MemberTile key={m.id} member={m} size={size} />
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
