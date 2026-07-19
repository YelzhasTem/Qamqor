"use client";

import { Languages } from "lucide-react";
import { localeLabels, type Locale } from "@/lib/i18n/marketing-copy";
import { useLanguage } from "@/components/marketing/language-provider";

const locales: Locale[] = ["ru", "kk", "en"];

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, copy } = useLanguage();

  return (
    <div className="language-switcher" aria-label={copy.language} role="group">
      {!compact ? <Languages aria-hidden="true" className="size-4 text-muted-foreground" /> : null}
      {locales.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLocale(item)}
          className="language-option"
          data-locale={item}
          data-active={locale === item}
          aria-pressed={locale === item}
        >
          {localeLabels[item]}
        </button>
      ))}
    </div>
  );
}
