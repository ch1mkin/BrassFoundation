"use client";

import { useLocale } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

/** Compact EN | ਪੰਜਾਬੀ toggle for the dark header */
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
      <button
        type="button"
        onClick={() => locale !== "en" && setLocale("en")}
        className={cn(
          "px-3 transition",
          locale === "en"
            ? "bg-white text-[#0B1C28]"
            : "text-white/70 hover:text-white",
        )}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => locale !== "pa" && setLocale("pa")}
        className={cn(
          "px-3 transition",
          locale === "pa"
            ? "bg-white text-[#0B1C28]"
            : "text-white/70 hover:text-white",
        )}
        aria-pressed={locale === "pa"}
        lang="pa"
      >
        ਪੰਜਾਬੀ
      </button>
    </div>
  );
}
