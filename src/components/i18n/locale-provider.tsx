"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_LOCALE,
  GOOGTRANS_COOKIE,
  LOCALE_COOKIE,
  type Locale,
  parseLocale,
} from "@/lib/i18n/config";
import { t as translate, type MessageKey } from "@/lib/i18n/messages";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: MessageKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function writeCookie(name: string, value: string, maxAge = 60 * 60 * 24 * 365) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${name}=; path=/; max-age=0; domain=${window.location.hostname}; SameSite=Lax`;
}

function applyDocumentLocale(locale: Locale) {
  document.documentElement.lang = locale === "pa" ? "pa" : "en";
  document.documentElement.classList.toggle("locale-pa", locale === "pa");
  document.documentElement.classList.toggle("locale-en", locale === "en");
}

function syncGoogleTranslate(locale: Locale) {
  if (locale === "pa") {
    writeCookie(GOOGTRANS_COOKIE, "/en/pa");
    writeCookie("googtrans", "/en/pa");
  } else {
    clearCookie(GOOGTRANS_COOKIE);
    clearCookie("googtrans");
  }
}

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            includedLanguages: string;
            autoDisplay: boolean;
          },
          elementId: string,
        ) => void;
      };
    };
  }
}

function ensureGoogleTranslateScript() {
  if (document.getElementById("google-translate-script")) return;

  window.googleTranslateElementInit = () => {
    if (!window.google?.translate?.TranslateElement) return;
    // Hidden host — we drive language via cookie + combo sync
    // eslint-disable-next-line no-new
    new window.google.translate.TranslateElement(
      {
        pageLanguage: "en",
        includedLanguages: "en,pa",
        autoDisplay: false,
      },
      "google_translate_element",
    );
  };

  const script = document.createElement("script");
  script.id = "google-translate-script";
  script.src =
    "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);
}

function forceGoogleCombo(locale: Locale) {
  const select = document.querySelector(
    ".goog-te-combo",
  ) as HTMLSelectElement | null;
  if (!select) return false;
  const value = locale === "pa" ? "pa" : "en";
  if (select.value !== value) {
    select.value = value;
    select.dispatchEvent(new Event("change"));
  }
  return true;
}

export function LocaleProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    applyDocumentLocale(locale);
    ensureGoogleTranslateScript();

    if (locale === "pa") {
      syncGoogleTranslate("pa");
      const tryForce = () => forceGoogleCombo("pa");
      if (!tryForce()) {
        const id = window.setInterval(() => {
          if (tryForce()) window.clearInterval(id);
        }, 400);
        window.setTimeout(() => window.clearInterval(id), 8000);
      }
    }
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    const resolved = parseLocale(next);
    writeCookie(LOCALE_COOKIE, resolved);
    syncGoogleTranslate(resolved);
    applyDocumentLocale(resolved);
    setLocaleState(resolved);

    // Reload so Google Translate cookie applies cleanly to full page content
    window.location.reload();
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key) => translate(locale, key),
    }),
    [locale, setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>
      <div id="google_translate_element" className="sr-only" aria-hidden />
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
