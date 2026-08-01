"use client";

import { cn } from "@/lib/utils";

/** Hard navigation to the membership registration page. */
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
    <a
      href="/membership"
      className={cn(className)}
      onClick={(e) => {
        onClick?.();
        // Full page load avoids soft-nav / hash quirks that can leave the form unreachable.
        e.preventDefault();
        window.location.assign("/membership");
      }}
    >
      {children}
    </a>
  );
}
