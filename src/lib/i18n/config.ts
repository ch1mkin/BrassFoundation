export const LOCALES = ["en", "pa", "hi"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "bf_locale";
export const GOOGTRANS_COOKIE = "googtrans";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  pa: "ਪੰਜਾਬੀ",
  hi: "हिन्दी",
};

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "pa" || value === "hi";
}

export function parseLocale(value: string | null | undefined): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function localeHtmlLang(locale: Locale): string {
  if (locale === "pa") return "pa";
  if (locale === "hi") return "hi";
  return "en";
}

export function googleTranslateTarget(locale: Locale): "pa" | "hi" | null {
  if (locale === "pa") return "pa";
  if (locale === "hi") return "hi";
  return null;
}
