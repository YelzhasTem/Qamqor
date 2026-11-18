"use client";

import { Logo } from "@/components/layout/logo";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";

/** Auth screens: soft grey page, one centred white card up to 440px wide. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-page pt-[var(--safe-top)] pb-[var(--safe-bottom)]">
      <div className="flex justify-end px-4 pt-3 sm:px-6 sm:pt-5">
        <LanguageSwitcher />
      </div>
      <main className="flex flex-1 items-start justify-center px-4 pt-4 pb-12 sm:items-center sm:pt-0">
        <div className="w-full max-w-[440px]">
          <div className="mb-6 flex justify-center"><Logo /></div>
          <div className="rounded-card border border-hairline bg-surface p-6 sm:p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
