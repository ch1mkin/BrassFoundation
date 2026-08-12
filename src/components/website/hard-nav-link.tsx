"use client";

import { cn } from "@/lib/utils";

/**
 * Native full-page navigation. Next.js client routing on this site often
 * shows a loader then stays on the same section when the RSC fetch aborts.
 */
export function HardNavLink({
  href,
  className,
  children,
  ...rest
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <a href={href} className={cn("touch-manipulation", className)} {...rest}>
      {children}
    </a>
  );
}
