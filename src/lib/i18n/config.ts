export const LOCALES = ["en", "pa"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "bf_locale";
export const GOOGTRANS_COOKIE = "googtrans";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  pa: "ਪੰਜਾਬੀ",
};

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "pa";
}

export function parseLocale(value: string | null | undefined): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
