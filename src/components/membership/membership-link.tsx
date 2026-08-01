"use client";

import { cn } from "@/lib/utils";

/**
 * Native link to the public membership registration page.
 * No preventDefault — browser navigation must always work.
 */
export function MembershipLink({
  className,
  children,
  onClick,
}: {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <a href="/membership" className={cn(className)} onClick={onClick}>
      {children}
    </a>
  );
}
