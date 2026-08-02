"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Link to the public membership registration page.
 */
export function MembershipLink({
  className,
  children,
  onClick,
  style,
}: {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
}) {
  return (
    <Link
      href="/membership"
      className={cn(className)}
      style={style}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
