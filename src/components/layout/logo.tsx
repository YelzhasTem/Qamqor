"use client";

import Link from "next/link";
import { useLanguage } from "@/components/i18n/language-provider";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

/** Letter mark on the brand accent, used in the logo and the app icon. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("flex size-9 items-center justify-center rounded-[10px] bg-brand text-lg font-extrabold leading-none text-brand-foreground", className)}>
      {brand.monogram}
    </span>
  );
}

export function Logo({ compact = false, className, href = "/" }: { compact?: boolean; className?: string; href?: string }) {
  const { t } = useLanguage();
  return (
    <Link href={href} className={cn("inline-flex min-h-11 items-center gap-2.5 rounded-control font-extrabold tracking-tight text-ink", className)} aria-label={t.common.home}>
      <LogoMark />
      {!compact ? <span className="text-lg">{brand.name}</span> : null}
    </Link>
  );
}
