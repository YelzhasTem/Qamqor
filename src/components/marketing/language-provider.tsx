"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { marketingCopy, type Locale } from "@/lib/i18n/marketing-copy";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  copy: (typeof marketingCopy)[Locale];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ru");

  useEffect(() => {
    const saved = window.localStorage.getItem("qamqor-language");
    if (saved === "ru" || saved === "kk" || saved === "en") {
      setLocaleState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem("qamqor-language", nextLocale);
    document.documentElement.lang = nextLocale;
  };

  const value = useMemo(() => ({ locale, setLocale, copy: marketingCopy[locale] }), [locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
