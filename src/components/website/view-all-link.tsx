import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";

/** Reliable native link for homepage section “View all” CTAs */
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
        buttonVariants({ variant: dark ? "outline" : "outline" }),
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
    </a>
  );
}
