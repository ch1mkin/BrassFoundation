"use client";

import { useLocale } from "@/components/i18n/locale-provider";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{ id: Locale; label: string; lang?: string }> = [
  { id: "en", label: "EN" },
  { id: "pa", label: "ਪੰਜਾਬੀ", lang: "pa" },
  { id: "hi", label: "हिन्दी", lang: "hi" },
];

/** Compact EN | ਪੰਜਾਬੀ | हिन्दी toggle for the dark header */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      className={cn(
        "notranslate inline-flex h-9 items-stretch overflow-hidden rounded-full bg-white/10 text-[11px] font-semibold tracking-wide",
        className,
      )}
      role="group"
      aria-label={t("lang.switchTo")}
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => locale !== opt.id && setLocale(opt.id)}
          className={cn(
            "px-2.5 transition sm:px-3",
            locale === opt.id
              ? "bg-white text-[#0B1C28]"
              : "text-white/70 hover:text-white",
          )}
          aria-pressed={locale === opt.id}
          lang={opt.lang}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
