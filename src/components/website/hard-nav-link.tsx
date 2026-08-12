"use client";

import { cn } from "@/lib/utils";
import { handleHardNavClick } from "@/lib/nav/hard-navigate";

/**
 * Full page navigation. Next.js client routing on this site often
 * finishes without changing the section.
 */
export function HardNavLink({
  href,
  className,
  children,
  onClick,
  ...rest
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <a
      href={href}
      className={cn("touch-manipulation", className)}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        handleHardNavClick(e, href);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
