"use client";

import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import { useLanguage } from "@/components/marketing/language-provider";

export function SiteFooter() {
  const { copy } = useLanguage();
  return (
    <footer className="marketing-footer">
      <div className="page-shell grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div><Logo className="text-primary-foreground [&_span:first-child]:border [&_span:first-child]:border-primary-foreground/25 [&_span:first-child]:bg-surface [&_span:first-child]:text-primary" /><p className="mt-5 max-w-sm text-sm leading-7 text-primary-foreground/75">{copy.footer.description}</p><div className="mt-6 inline-flex rounded-full bg-surface/10 p-1"><LanguageSwitcher compact /></div></div>
        <div><h3 className="font-black">{copy.footer.platform}</h3><div className="mt-5 grid gap-3 text-sm text-primary-foreground/75"><Link href="/projects">{copy.footer.projects}</Link><Link href="/auth/register">{copy.footer.volunteer}</Link><Link href="/auth/register?role=coordinator">{copy.footer.coordinator}</Link></div></div>
        <div><h3 className="font-black">Qamqor</h3><div className="mt-5 grid gap-3 text-sm text-primary-foreground/75"><Link href="/#about">{copy.footer.about}</Link><Link href="/#advantages">{copy.footer.features}</Link><a href="mailto:hello@qamqor.kz">hello@qamqor.kz</a></div></div>
      </div>
      <div className="page-shell border-t border-primary-foreground/12 py-6 text-xs text-primary-foreground/65">© {new Date().getFullYear()} Qamqor. {copy.footer.rights}</div>
    </footer>
  );
}
