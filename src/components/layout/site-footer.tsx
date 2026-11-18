"use client";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useLanguage } from "@/components/i18n/language-provider";
import { brand } from "@/config/brand";

export function SiteFooter() {
  const { t } = useLanguage();
  return (
    <footer className="mt-16 border-t border-hairline bg-surface pb-[var(--safe-bottom)]">
      <div className="page-shell flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-secondary">© {new Date().getFullYear()} {brand.name}</p>
        <div className="flex items-center gap-3">
          <span className="text-sm text-ink-secondary">{t.marketing.footer.languages}</span>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
