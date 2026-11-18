"use client";

import { locales, localeLabels, localeNames } from "@/lib/i18n/config";
import { useLanguage } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";

/** Compact segmented language switcher. Every option is a 44px target. */
export function LanguageSwitcher({ className, tone = "default" }: { className?: string; tone?: "default" | "onDark" }) {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t.common.language}
      className={cn(
        "inline-flex items-center rounded-full p-0.5",
        tone === "onDark" ? "bg-white/10" : "border border-hairline bg-surface",
        className,
      )}
    >
      {locales.map((item) => {
        const active = locale === item;
        return (
          <button
            key={item}
            type="button"
            lang={item}
            onClick={() => setLocale(item)}
            aria-pressed={active}
            title={localeNames[item]}
            className={cn(
              "inline-flex h-11 min-w-11 items-center justify-center rounded-full px-2.5 text-xs font-bold tracking-wide transition-colors",
              tone === "onDark"
                ? active ? "bg-white text-ink" : "text-white/80 hover:text-white"
                : active ? "bg-ink text-white" : "text-ink-secondary hover:text-ink",
            )}
          >
            <span aria-hidden="true">{localeLabels[item]}</span>
            <span className="sr-only">{localeNames[item]}</span>
          </button>
        );
      })}
    </div>
  );
}
