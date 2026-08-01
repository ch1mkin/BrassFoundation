"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type HamburgerButtonProps = {
  open: boolean;
  onClick: () => void;
  className?: string;
  light?: boolean;
};

export function HamburgerButton({
  open,
  onClick,
  className,
  light = false,
}: HamburgerButtonProps) {
  const bar = light ? "bg-white" : "bg-foreground";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      className={cn(
        "relative flex size-11 items-center justify-center rounded-2xl transition-colors",
        light ? "hover:bg-white/10" : "hover:bg-muted",
        className,
      )}
    >
      <span className="relative block h-3.5 w-5">
        <motion.span
          className={cn("absolute left-0 top-0 h-[1.5px] w-5 rounded-full", bar)}
          animate={open ? { rotate: 45, y: 6.5 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.span
          className={cn(
            "absolute left-0 top-[6.5px] h-[1.5px] w-5 rounded-full",
            bar,
          )}
          animate={open ? { opacity: 0, x: -4 } : { opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        />
        <motion.span
          className={cn(
            "absolute left-0 top-[13px] h-[1.5px] w-5 rounded-full",
            bar,
          )}
          animate={open ? { rotate: -45, y: -6.5 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        />
      </span>
    </button>
  );
}
