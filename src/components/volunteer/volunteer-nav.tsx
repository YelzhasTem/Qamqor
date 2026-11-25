"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ClipboardList, Clock3, LayoutList, QrCode, UserRound } from "lucide-react";
import { useLanguage } from "@/components/i18n/language-provider";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

type Destination = { href: string; key: "feed" | "applications" | "qr" | "hours" | "profile"; icon: LucideIcon };

const destinations: Destination[] = [
  { href: "/dashboard", key: "feed", icon: LayoutList },
  { href: "/applications", key: "applications", icon: ClipboardList },
  { href: "/qr", key: "qr", icon: QrCode },
  { href: "/hours", key: "hours", icon: Clock3 },
  { href: "/profile", key: "profile", icon: UserRound },
];

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Fixed bottom tab bar for phones (hidden from 768px). */
export function VolunteerTabBar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const labels = t.volunteer.shell;
  return (
    <nav aria-label={labels.navLabel} className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-surface pb-[var(--safe-bottom)] md:hidden">
      <ul className="mx-auto grid max-w-[640px] grid-cols-5">
        {destinations.map(({ href, key, icon: Icon }) => {
          const current = isCurrent(pathname, href);
          if (key === "qr") {
            return (
              <li key={key} className="flex items-center justify-center py-1.5">
                <Link
                  href={href}
                  aria-label={labels.qr}
                  aria-current={current ? "page" : undefined}
                  className="flex size-[52px] items-center justify-center rounded-[16px] bg-brand text-brand-foreground transition-colors hover:bg-brand-hover"
                >
                  <QrCode aria-hidden="true" className="size-6" />
                </Link>
              </li>
            );
          }
          return (
            <li key={key}>
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] leading-tight transition-colors",
                  current ? "font-bold text-ink" : "font-medium text-ink-secondary hover:text-ink",
                )}
              >
                <Icon aria-hidden="true" className="size-6" strokeWidth={current ? 2.4 : 2} />
                <span className="max-w-full truncate">{labels[key]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Left rail with the logo and the same five destinations, from 768px. */
export function VolunteerRail() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const labels = t.volunteer.shell;
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-hairline bg-surface px-4 py-5 md:flex">
      <Logo href="/dashboard" className="px-2" />
      <nav aria-label={labels.navLabel} className="mt-8">
        <ul className="grid gap-1">
          {destinations.map(({ href, key, icon: Icon }) => {
            const current = isCurrent(pathname, href);
            return (
              <li key={key}>
                <Link
                  href={href}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center gap-3 rounded-row px-3 text-[15px] transition-colors",
                    current ? "bg-inset font-bold text-ink" : "font-medium text-ink-secondary hover:bg-page hover:text-ink",
                  )}
                >
                  {key === "qr" ? (
                    <span className="flex size-8 items-center justify-center rounded-[10px] bg-brand text-brand-foreground">
                      <Icon aria-hidden="true" className="size-[18px]" />
                    </span>
                  ) : (
                    <span className="flex size-8 items-center justify-center"><Icon aria-hidden="true" className="size-5" /></span>
                  )}
                  {labels[key]}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
