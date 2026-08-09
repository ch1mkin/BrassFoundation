"use client";

import { DonateNowLink } from "@/components/membership/donate-now-link";
import { MembershipLink } from "@/components/membership/membership-link";
import { MaterialIcon } from "@/components/ui/material-icon";
import { GOLD_SHINY_BTN, GOLD_SHINY_STYLE } from "@/lib/ui/gold-btn";
import { cn } from "@/lib/utils";

/** Shared Donate Now class — primary teal, readable on light and dark surfaces. */
export const DONATE_NOW_BTN =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground shadow-md transition hover:bg-primary/90 sm:h-14 sm:px-8 sm:text-base";

/** Gold Become a Member + Donate Now pair — matches hero / header CTAs. */
export function GoldMembershipCta({
  className,
  label = "Become a Member",
  donateLabel = "Donate Now",
  showDonate = true,
  donateClassName,
}: {
  className?: string;
  label?: string;
  donateLabel?: string;
  showDonate?: boolean;
  donateClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center",
        className,
      )}
    >
      <MembershipLink
        className={cn(GOLD_SHINY_BTN, "shadow-lg")}
        style={GOLD_SHINY_STYLE}
      >
        <span>{label}</span>
        <MaterialIcon name="person_add" className="text-[20px]" />
      </MembershipLink>
      {showDonate ? (
        <DonateNowLink className={cn(DONATE_NOW_BTN, donateClassName)}>
          <span>{donateLabel}</span>
          <MaterialIcon name="volunteer_activism" className="text-[20px]" />
        </DonateNowLink>
      ) : null}
    </div>
  );
}
