"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Native link to the public membership registration page.
 * No preventDefault — browser navigation must always work.
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
    <a
      href="/membership"
      className={cn(className)}
      style={style}
      onClick={onClick}
    >
      {children}
    </a>
  );
}
