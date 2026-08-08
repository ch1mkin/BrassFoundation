"use client";

import { cn } from "@/lib/utils";

/**
 * Language switching is temporarily locked to English.
 * Keep the control visible so layout stays stable; other locales are hidden.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "notranslate inline-flex h-9 items-stretch overflow-hidden rounded-full bg-white/10 text-[11px] font-semibold tracking-wide",
        className,
      )}
      role="group"
      aria-label="Language (English only)"
      title="Language switching is temporarily unavailable"
    >
      <span
        className="inline-flex items-center bg-white px-2.5 text-[#0B1C28] sm:px-3"
        aria-current="true"
      >
        EN
      </span>
    </div>
  );
}
