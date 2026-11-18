"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function SiteHeaderClient({ signedIn, showOrganizations }: { signedIn: boolean; showOrganizations: boolean }) {
  const { t } = useLanguage();
  const home = signedIn ? "/landing" : "/";
  const appHref = signedIn ? "/dashboard" : "/auth/register";

  const links = [
    ...(showOrganizations ? [{ href: `${home}#organizations`, label: t.marketing.nav.organizations }] : []),
    { href: `${home}#how-it-works`, label: t.marketing.nav.howItWorks },
    ...(signedIn ? [] : [{ href: "/auth/login", label: t.marketing.nav.signIn }]),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-page/90 pt-[var(--safe-top)] backdrop-blur">
      <div className="page-shell flex h-16 items-center justify-between gap-3">
        <Logo href={home} />
        <nav className="hidden items-center gap-1 lg:flex" aria-label={t.common.menu}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="inline-flex h-11 items-center rounded-full px-4 text-[15px] font-semibold text-ink-secondary transition-colors hover:bg-inset hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher className="hidden md:inline-flex" />
          <Button asChild className="hidden sm:inline-flex"><Link href={appHref}>{t.marketing.nav.openApp}</Link></Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" size="icon" className="lg:hidden" aria-label={t.common.openMenu}><Menu /></Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
              <Logo href={home} />
              <nav className="mt-8 grid gap-1" aria-label={t.common.menu}>
                {links.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link href={link.href} className="flex min-h-12 items-center rounded-row px-3 text-lg font-bold hover:bg-inset">{link.label}</Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-6"><LanguageSwitcher /></div>
              <div className="mt-auto pt-8">
                <Button asChild size="lg" className="w-full"><Link href={appHref}>{t.marketing.nav.openApp}</Link></Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
