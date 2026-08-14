"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_LOCALE, getLanguageLabel, LOCALES, SUPPORTED_LANGUAGES, TRANSLATIONS_FR, type Locale } from "@/lib/i18n";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
  languages: Array<{ code: Locale; label: string }>;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key) => key,
  languages: SUPPORTED_LANGUAGES,
});

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  /* run 3 : l'anglais ne voyage plus dans le bundle initial — il
     arrive par import() et la locale ne bascule qu'une fois le
     dictionnaire là (un seul remontage LocaleKeyed, jamais de page
     mi-FR mi-EN) */
  const enDict = useRef<Record<string, string> | null>(null);

  const activate = (next: Locale) => {
    if (next === "en" && !enDict.current) {
      import("@/lib/i18n-en").then((m) => {
        enDict.current = m.default;
        setLocaleState("en");
      });
      return;
    }
    setLocaleState(next);
  };

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("neva-locale") : null;
    if (stored && LOCALES.includes(stored as Locale)) {
      activate(stored as Locale);
      return;
    }

    if (typeof window !== "undefined") {
      const browserLocale = window.navigator.language.split("-")[0] as Locale;
      if (LOCALES.includes(browserLocale)) {
        activate(browserLocale);
        window.localStorage.setItem("neva-locale", browserLocale);
        return;
      }
    }

    setLocaleState(DEFAULT_LOCALE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = (newLocale: Locale) => {
    activate(newLocale);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("neva-locale", newLocale);
    }
  };

  const translations = locale === "en" && enDict.current ? enDict.current : TRANSLATIONS_FR;

  const contextValue = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: string, fallback = "") => (translations[key] ?? fallback) || key,
      languages: SUPPORTED_LANGUAGES,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, translations]
  );

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
}

export function useTranslations() {
  return useContext(LanguageContext);
}

export function useLanguage() {
  const { locale, setLocale, languages } = useContext(LanguageContext);
  return { locale, setLocale, languages, getLanguageLabel };
}
