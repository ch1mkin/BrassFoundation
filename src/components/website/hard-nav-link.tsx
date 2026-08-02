"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Next.js Link that always does a full page navigation.
 * Soft client routing has been unreliable on this site (mobile overlays / i18n).
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
    <Link
      href={href}
      prefetch={false}
      className={cn("touch-manipulation", className)}
      onClick={(e) => {
        e.preventDefault();
        window.location.assign(href);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
