"use client";

import Link from "next/link";
import { ArrowRight, LayoutDashboard, Menu } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import { useLanguage } from "@/components/marketing/language-provider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function SiteHeaderClient({ signedIn }: { signedIn: boolean }) {
  const { copy } = useLanguage();

  const links = [
    { href: "/projects", label: copy.nav.projects },
    { href: "/#advantages", label: copy.nav.features },
    { href: "/#activities", label: copy.nav.activities },
    { href: "/#about", label: copy.nav.about },
  ];

  return (
    <header className="marketing-header">
      <div className="page-shell flex h-20 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 rounded-full border bg-surface/75 p-1.5 shadow-sm backdrop-blur-xl lg:flex" aria-label={copy.nav.about}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-full px-4 py-2 text-sm font-bold text-muted-foreground transition hover:bg-primary/7 hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="sm:hidden"><LanguageSwitcher compact /></div>
          <div className="hidden sm:block"><LanguageSwitcher /></div>
          {signedIn ? (
            <Button asChild className="hidden lg:inline-flex"><Link href="/dashboard"><LayoutDashboard />{copy.nav.account}</Link></Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden xl:inline-flex"><Link href="/auth/login">{copy.nav.login}</Link></Button>
              <Button asChild className="hidden lg:inline-flex"><Link href="/auth/register">{copy.nav.start}<ArrowRight /></Link></Button>
            </>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Menu"><Menu /></Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
              <Logo />
              <div className="mt-8 sm:hidden"><LanguageSwitcher /></div>
              <nav className="mt-8 grid gap-2">
                {links.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link href={link.href} className="rounded-2xl px-4 py-3 text-lg font-black transition hover:bg-primary/7 hover:text-primary">{link.label}</Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto grid gap-3 pt-8">
                {signedIn ? (
                  <Button asChild size="lg"><Link href="/dashboard"><LayoutDashboard />{copy.nav.account}</Link></Button>
                ) : (
                  <>
                    <Button asChild variant="outline" size="lg"><Link href="/auth/login">{copy.nav.login}</Link></Button>
                    <Button asChild size="lg"><Link href="/auth/register">{copy.nav.start}<ArrowRight /></Link></Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
