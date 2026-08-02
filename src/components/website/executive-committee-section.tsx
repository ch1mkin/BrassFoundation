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
  size: "lg" | "sm";
}) {
  const photo =
    size === "lg"
      ? "size-28 sm:size-36 md:size-40"
      : "size-16 sm:size-20 md:size-24";
  const title =
    size === "lg"
      ? "text-base sm:text-lg md:text-xl"
      : "text-xs sm:text-sm";
  const role =
    size === "lg" ? "text-sm sm:text-base" : "text-[10px] sm:text-xs";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex min-w-0 flex-col items-center text-center"
    >
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-full border-4 border-white bg-surface-highest shadow-md",
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
              size === "lg" ? "text-2xl sm:text-3xl" : "text-sm sm:text-lg",
            )}
          >
            {initialsFor(member.full_name) || "—"}
          </span>
        )}
      </div>
      <h3
        className={cn(
          "font-heading mt-2 font-semibold leading-tight text-foreground",
          title,
        )}
      >
        {member.full_name}
      </h3>
      <p className={cn("mt-0.5 font-medium text-primary", role)}>
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
 * Landscape executive layout: Chair + Vice side-by-side (large),
 * remaining members in rows of 3 (smaller) — same on mobile & desktop.
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

      <div className="mx-auto max-w-[1280px] space-y-8 px-3 sm:space-y-10 sm:px-6 lg:px-20">
        {leaders.length > 0 ? (
          <div className="grid grid-cols-2 justify-items-center gap-4 sm:gap-10 md:gap-16">
            {leaders.map((m) => (
              <MemberTile key={m.id} member={m} size="lg" />
            ))}
          </div>
        ) : null}

        {rest.length > 0 ? (
          <div className="grid grid-cols-3 gap-x-2 gap-y-6 sm:gap-x-6 sm:gap-y-8 md:gap-x-10">
            {rest.map((m) => (
              <MemberTile key={m.id} member={m} size="sm" />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
