"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import {
  DEFAULT_LOCALE,
  GOOGTRANS_COOKIE,
  LOCALE_COOKIE,
  googleTranslateTarget,
  localeHtmlLang,
  type Locale,
} from "@/lib/i18n/config";
import { t as translateBuiltin, type MessageKey } from "@/lib/i18n/messages";
import {
  lockNonContentFromTranslate,
  restoreWritingContent,
  translateWritingContent,
} from "@/lib/i18n/content-translate";

export type TranslationRow = {
  en: string;
  pa: string | null;
  hi?: string | null;
};

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: MessageKey | string) => string;
  translations: Record<string, TranslationRow>;
  translating: boolean;
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
  document
    .querySelectorAll(".goog-te-banner-frame, .skiptranslate, #goog-gt-tt")
    .forEach((el) => el.remove());
  document.body.style.top = "";
  document.documentElement.classList.remove("translated-ltr", "translated-rtl");
}

function applyDocumentLocale(locale: Locale) {
  document.documentElement.lang = localeHtmlLang(locale);
  document.documentElement.classList.toggle("locale-pa", locale === "pa");
  document.documentElement.classList.toggle("locale-hi", locale === "hi");
  document.documentElement.classList.toggle("locale-en", locale === "en");
}

export function LocaleProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
  initialTranslations = {},
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
  initialTranslations?: Record<string, TranslationRow>;
}) {
  // Language switcher is locked — always run in English for now.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [translations, setTranslations] = useState(initialTranslations);
  const [translating, setTranslating] = useState(false);
  const pathname = usePathname();
  const skipInitialRouteTranslate = useRef(true);
  const translateGen = useRef(0);

  useEffect(() => {
    writeCookie(LOCALE_COOKIE, DEFAULT_LOCALE);
    setLocaleState(DEFAULT_LOCALE);
    clearGoogleTranslateArtifacts();
    applyDocumentLocale(DEFAULT_LOCALE);
    restoreWritingContent();
  }, []);

  // Silence unused prop while language is locked to English.
  void initialLocale;

  useEffect(() => {
    setTranslations(initialTranslations);
  }, [initialTranslations]);

  const runTranslate = useCallback(async (next: Locale, showLoader: boolean) => {
    const gen = ++translateGen.current;
    clearGoogleTranslateArtifacts();
    applyDocumentLocale(next);
    lockNonContentFromTranslate();

    if (showLoader) setTranslating(true);
    try {
      const target = googleTranslateTarget(next);
      if (target) {
        // Let the loader paint before heavy work
        await new Promise((r) => window.setTimeout(r, 40));
        if (gen !== translateGen.current) return;
        await translateWritingContent(target);
      } else {
        restoreWritingContent();
      }
    } finally {
      if (gen === translateGen.current) {
        setTranslating(false);
      }
    }
  }, []);

  // Locale / route changes: only show a loader when actually translating
  // to Punjabi/Hindi. English is the default — never block the UI with
  // the pen overlay on member/admin section switches.
  useEffect(() => {
    const target = googleTranslateTarget(locale);
    if (!target) return;

    const isFirst = skipInitialRouteTranslate.current;
    skipInitialRouteTranslate.current = false;

    const observer = new MutationObserver(() => lockNonContentFromTranslate());
    observer.observe(document.body, { childList: true, subtree: true });

    const timer = window.setTimeout(() => {
      void runTranslate(locale, true);
    }, isFirst ? 120 : 40);

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [locale, pathname, runTranslate]);

  const setLocale = useCallback((..._args: Locale[]) => {
    void _args;
    // Language switching temporarily disabled — keep English only.
    writeCookie(LOCALE_COOKIE, DEFAULT_LOCALE);
    setLocaleState(DEFAULT_LOCALE);
  }, []);

  const t = useCallback(
    (key: MessageKey | string) => {
      const row = translations[key];
      if (locale === "pa" && row?.pa?.trim()) return row.pa;
      if (locale === "hi" && row?.hi?.trim()) return row.hi;
      if (row?.en?.trim()) return row.en;
      return translateBuiltin(locale, key as MessageKey);
    },
    [locale, translations],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t, translations, translating }),
    [locale, setLocale, t, translations, translating],
  );

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
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
  hi?: string | null,
) {
  if (locale === "pa" && pa?.trim()) return pa;
  if (locale === "hi" && hi?.trim()) return hi;
  return en;
}
