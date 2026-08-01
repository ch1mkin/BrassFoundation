"use client";

import { Languages } from "lucide-react";
import { useLocale } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      className={cn(
        "notranslate inline-flex items-center rounded-lg border border-white/20 bg-white/5 p-0.5",
        className,
      )}
      role="group"
      aria-label={t("lang.switchTo")}
    >
      {!compact ? (
        <Languages className="ml-1.5 size-3.5 text-white/60" aria-hidden />
      ) : null}
      <button
        type="button"
        onClick={() => locale !== "en" && setLocale("en")}
        className={cn(
          "rounded-md px-2.5 py-1.5 text-xs font-semibold transition",
          locale === "en"
            ? "bg-brand text-[#004149]"
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
          "rounded-md px-2.5 py-1.5 text-xs font-semibold transition",
          locale === "pa"
            ? "bg-brand text-[#004149]"
            : "text-white/70 hover:text-white",
        )}
        aria-pressed={locale === "pa"}
        lang="pa"
      >
        ਪੰ
      </button>
    </div>
  );
}
