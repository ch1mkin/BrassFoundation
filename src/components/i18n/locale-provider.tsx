"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import {
  DEFAULT_LOCALE,
  GOOGTRANS_COOKIE,
  LOCALE_COOKIE,
  type Locale,
  parseLocale,
} from "@/lib/i18n/config";
import { t as translateBuiltin, type MessageKey } from "@/lib/i18n/messages";
import {
  lockNonContentFromTranslate,
  restoreWritingContent,
  translateWritingContent,
} from "@/lib/i18n/content-translate";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: MessageKey | string) => string;
  translations: Record<string, { en: string; pa: string | null }>;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function writeCookie(name: string, value: string, maxAge = 60 * 60 * 24 * 365) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${name}=; path=/; max-age=0; domain=${window.location.hostname}; SameSite=Lax`;
}

function clearGoogleTranslateArtifacts() {
  clearCookie(GOOGTRANS_COOKIE);
  clearCookie("googtrans");
  // Remove leftover GT DOM chrome if any old session injected it
  document
    .querySelectorAll(".goog-te-banner-frame, .skiptranslate, #goog-gt-tt")
    .forEach((el) => el.remove());
  document.body.style.top = "";
  document.documentElement.classList.remove("translated-ltr", "translated-rtl");
}

function applyDocumentLocale(locale: Locale) {
  document.documentElement.lang = locale === "pa" ? "pa" : "en";
  document.documentElement.classList.toggle("locale-pa", locale === "pa");
  document.documentElement.classList.toggle("locale-en", locale === "en");
}

export function LocaleProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
  initialTranslations = {},
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
  initialTranslations?: Record<string, { en: string; pa: string | null }>;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [translations, setTranslations] = useState(initialTranslations);
  const pathname = usePathname();

  useEffect(() => {
    setTranslations(initialTranslations);
  }, [initialTranslations]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/i18n/translations")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data?.translations) {
          setTranslations(data.translations);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Never use full-page Google Translate — it breaks icon fonts.
    clearGoogleTranslateArtifacts();
    applyDocumentLocale(locale);
    lockNonContentFromTranslate();

    const observer = new MutationObserver(() => lockNonContentFromTranslate());
    observer.observe(document.body, { childList: true, subtree: true });

    let cancelled = false;

    async function run() {
      if (locale === "pa") {
        await translateWritingContent();
      } else {
        restoreWritingContent();
      }
    }

    // Wait a tick for page content to paint (and on route changes)
    const timer = window.setTimeout(() => {
      if (!cancelled) void run();
    }, 80);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [locale, pathname]);

  const setLocale = useCallback((next: Locale) => {
    const resolved = parseLocale(next);
    writeCookie(LOCALE_COOKIE, resolved);
    clearGoogleTranslateArtifacts();
    applyDocumentLocale(resolved);
    setLocaleState(resolved);
    // Soft switch without full reload when possible
    if (resolved === "pa") {
      void translateWritingContent();
    } else {
      restoreWritingContent();
      window.location.reload();
    }
  }, []);

  const t = useCallback(
    (key: MessageKey | string) => {
      const row = translations[key];
      if (locale === "pa") {
        if (row?.pa?.trim()) return row.pa;
      }
      if (row?.en?.trim()) return row.en;
      return translateBuiltin(locale, key as MessageKey);
    },
    [locale, translations],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t, translations }),
    [locale, setLocale, t, translations],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}

export function pickLocalized(
  locale: Locale,
  en: string,
  pa?: string | null,
) {
  if (locale === "pa" && pa?.trim()) return pa;
  return en;
}
