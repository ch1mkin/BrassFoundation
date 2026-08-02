/* eslint-disable @next/next/no-html-link-for-pages --
 * Native <a> so View all works on mobile; Next soft-nav was unreliable with
 * section overlays / touch stacking.
 */
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";

/** Homepage section “View all” CTAs — hard navigation, mobile-sized hit target */
export function ViewAllLink({
  href,
  children = "View all",
  className,
  dark,
  withArrow,
}: {
  href: string;
  children?: React.ReactNode;
  className?: string;
  dark?: boolean;
  withArrow?: boolean;
}) {
  return (
    <a
      href={href}
      className={cn(
        buttonVariants({ variant: "outline" }),
        "pointer-events-auto relative z-40 inline-flex min-h-11 shrink-0 touch-manipulation items-center justify-center gap-1.5 rounded-full px-4 text-sm sm:min-h-10 sm:px-4",
        dark &&
          "border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white",
        className,
      )}
    >
      <span className="relative z-10">{children}</span>
      {withArrow ? (
        <MaterialIcon
          name="trending_flat"
          className="relative z-10 text-[18px]"
        />
      ) : null}
    </a>
  );
}
