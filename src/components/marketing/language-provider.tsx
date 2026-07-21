"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { marketingCopy, type Locale } from "@/lib/i18n/marketing-copy";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  copy: (typeof marketingCopy)[Locale];
};

const defaultLanguageContext: LanguageContextValue = {
  locale: "ru",
  setLocale: () => undefined,
  copy: marketingCopy.ru,
};

const LanguageContext = createContext<LanguageContextValue>(defaultLanguageContext);

function isLocale(value: string | null): value is Locale {
  return value === "ru" || value === "kk" || value === "en";
}

function persistLocale(locale: Locale) {
  window.localStorage.setItem("qamqor-language", locale);
  document.cookie = `qamqor-language=${locale}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.lang = locale;
}

export function LanguageProvider({ children, initialLocale = "ru" }: { children: React.ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const saved = window.localStorage.getItem("qamqor-language");
    if (isLocale(saved) && saved !== initialLocale) {
      setLocaleState(saved);
      persistLocale(saved);
    } else {
      persistLocale(initialLocale);
    }
  }, [initialLocale]);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    persistLocale(nextLocale);
  };

  const value = useMemo(() => ({ locale, setLocale, copy: marketingCopy[locale] }), [locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
