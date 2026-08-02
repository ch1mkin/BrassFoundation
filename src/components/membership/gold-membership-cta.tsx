"use client";

import { MembershipLink } from "@/components/membership/membership-link";
import { MaterialIcon } from "@/components/ui/material-icon";
import { GOLD_SHINY_BTN, GOLD_SHINY_STYLE } from "@/lib/ui/gold-btn";
import { cn } from "@/lib/utils";

/** Gold Become a Member button — matches hero / header CTA. */
export function GoldMembershipCta({
  className,
  label = "Become a Member",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <MembershipLink
      className={cn(GOLD_SHINY_BTN, "shadow-lg", className)}
      style={GOLD_SHINY_STYLE}
    >
      <span>{label}</span>
      <MaterialIcon name="person_add" className="text-[20px]" />
    </MembershipLink>
  );
}
