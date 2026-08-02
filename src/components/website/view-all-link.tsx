import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";

/** Homepage section “View all” CTAs */
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
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant: "outline" }),
        "pointer-events-auto relative z-30 inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 text-xs sm:px-4 sm:text-sm",
        dark &&
          "border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white",
        className,
      )}
    >
      {children}
      {withArrow ? (
        <MaterialIcon name="trending_flat" className="text-[18px]" />
      ) : null}
    </Link>
  );
}
