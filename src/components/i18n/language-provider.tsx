"use client";

import { createContext, useCallback, useContext, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, defaultLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionaries";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
  isSwitching: boolean;
};

const LanguageContext = createContext<LanguageContextValue>({
  locale: defaultLocale,
  setLocale: () => undefined,
  t: getDictionary(defaultLocale),
  isSwitching: false,
});

function persistLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.lang = locale;
}

/**
 * App-wide language state. The locale lives in a cookie (no URL prefixes) so
 * server components render in the same language; switching refreshes them.
 */
export function LanguageProvider({ children, initialLocale }: { children: React.ReactNode; initialLocale: Locale }) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [isSwitching, startTransition] = useTransition();

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    persistLocale(nextLocale);
    startTransition(() => router.refresh());
  }, [router]);

  const value = useMemo(
    () => ({ locale, setLocale, t: getDictionary(locale), isSwitching }),
    [locale, setLocale, isSwitching],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
