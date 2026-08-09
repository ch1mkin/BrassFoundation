"use client";

import type { CSSProperties } from "react";
import { HardNavLink } from "@/components/website/hard-nav-link";
import { cn } from "@/lib/utils";

/** Always opens the membership / register form. */
export const DONATE_NOW_HREF = "/membership#register";

/**
 * Donate Now CTA — full navigation to Become a Member form.
 */
export function DonateNowLink({
  className,
  children = "Donate Now",
  onClick,
  style,
}: {
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
}) {
  return (
    <HardNavLink
      href={DONATE_NOW_HREF}
      className={cn(className)}
      style={style}
      onClick={onClick}
    >
      {children}
    </HardNavLink>
  );
}
