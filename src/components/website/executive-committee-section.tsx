"use client";

import { motion } from "framer-motion";
import type { ExecutiveMember } from "@/lib/content/committee";
import { cn } from "@/lib/utils";

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
}: {
  member: ExecutiveMember;
  size: "lg" | "md" | "sm";
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
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photo_url}
            alt={member.full_name}
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

/**
 * Build widening pyramid row sizes that sum to n.
 * Never leaves a lone person on a row (unless n === 1).
 * Last row is always the widest — flat base.
 */
function pyramidRowSizes(n: number): number[] {
  if (n <= 0) return [];
  if (n === 1) return [1];
  if (n <= 4) return [n];

  // Prefer 2 rows: smaller top, wider flat base (never a lone person)
  for (let top = Math.floor((n - 1) / 2); top >= 2; top--) {
    const base = n - top;
    if (base >= top && base >= 2) return [top, base];
  }

  // 3 rows: a <= b < c (flat base widest)
  for (let base = Math.ceil(n / 2); base <= n - 4; base++) {
    const rem = n - base;
    for (let mid = Math.min(base - 1, rem - 2); mid >= 2; mid--) {
      const top = rem - mid;
      if (top >= 2 && top <= mid) return [top, mid, base];
    }
  }

  // Even fallback — chunks of at least 2
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
};

/**
 * Pyramid: Chair + Vice on top (large), then widening rows with a flat base.
 * No orphan single-person rows on desktop or mobile.
 */
export function LeadershipSection({
  members,
}: {
  members: ExecutiveMember[];
}) {
  const chair = members.find((m) => isChair(m.role_title));
  const vice = members.find((m) => isVice(m.role_title));
  const rest = members.filter(
    (m) => !isChair(m.role_title) && !isVice(m.role_title),
  );
  const leaders = [chair, vice].filter(Boolean) as ExecutiveMember[];

  const sizes = pyramidRowSizes(rest.length);
  const rows = splitIntoRows(rest, sizes);

  return (
    <section className="bg-surface-high py-10 sm:py-14 lg:py-16">
      <div className="mx-auto mb-8 max-w-[1280px] px-4 text-center sm:mb-10 sm:px-6 lg:px-20">
        <h2 className="font-heading mb-2 text-2xl font-semibold sm:text-3xl">
          Executive Committee
        </h2>
        <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
          The committee guiding Brass Foundation&apos;s mission of education,
          equality, and community development.
        </p>
      </div>

      <div className="mx-auto flex max-w-[1280px] flex-col items-stretch gap-6 px-2 sm:gap-8 sm:px-6 lg:gap-10 lg:px-20">
        {leaders.length > 0 ? (
          <div
            className={cn(
              "mx-auto grid w-full max-w-2xl justify-items-center gap-3 sm:gap-10",
              leaders.length === 1 ? "grid-cols-1" : "grid-cols-2",
            )}
          >
            {leaders.map((m) => (
              <MemberTile key={m.id} member={m} size="lg" />
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
