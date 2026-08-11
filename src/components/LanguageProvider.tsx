"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LOCALE, getLanguageLabel, getTranslations, LOCALES, SUPPORTED_LANGUAGES, type Locale } from "@/lib/i18n";

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

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("neva-locale") : null;
    if (stored && LOCALES.includes(stored as Locale)) {
      setLocaleState(stored as Locale);
      return;
    }

    if (typeof window !== "undefined") {
      const browserLocale = window.navigator.language.split("-")[0] as Locale;
      if (LOCALES.includes(browserLocale)) {
        setLocaleState(browserLocale);
        window.localStorage.setItem("neva-locale", browserLocale);
        return;
      }
    }

    setLocaleState(DEFAULT_LOCALE);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("neva-locale", newLocale);
    }
  };

  const translations = getTranslations(locale);

  const contextValue = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: string, fallback = "") => (translations[key] ?? fallback) || key,
      languages: SUPPORTED_LANGUAGES,
    }),
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
