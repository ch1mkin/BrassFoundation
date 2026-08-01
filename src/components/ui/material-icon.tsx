"use client";

import { cn } from "@/lib/utils";

/**
 * Material Symbols glyph — never pass through translators.
 * Ligature names like person_add must stay exact English tokens.
 */
export function MaterialIcon({
  name,
  className,
  label,
}: {
  name: string;
  className?: string;
  /** Accessible label; icons are decorative by default */
  label?: string;
}) {
  return (
    <span
      className={cn("material-symbols-outlined notranslate", className)}
      translate="no"
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      data-icon={name}
    >
      {name}
    </span>
  );
}
