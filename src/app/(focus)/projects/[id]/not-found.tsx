"use client";

import Link from "next/link";
import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";

export default function ProjectNotFound() {
  const { t } = useLanguage();
  return (
    <main className="mx-auto max-w-[640px] px-4 py-24 text-center">
      <p className="text-sm font-bold text-ink-secondary">404</p>
      <h1 className="mt-3 text-[28px] font-extrabold">{t.marketing.errors.notFoundTitle}</h1>
      <p className="mt-3 text-ink-secondary">{t.marketing.errors.notFoundDescription}</p>
      <Button asChild className="mt-7"><Link href="/dashboard">{t.volunteer.project.backToFeed}</Link></Button>
    </main>
  );
}
