"use client";

import Link from "next/link";
import { QrCode } from "lucide-react";
import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";
import { formatEventStart } from "@/lib/datetime";

/** The nearest approved event, on the brand accent, with a shortcut to its QR code. */
export function NextEventCard({ applicationId, title, startDate }: { applicationId: string; title: string; startDate: string }) {
  const { locale, t } = useLanguage();
  return (
    <section aria-label={t.volunteer.feed.nextEvent} className="rounded-card bg-brand p-5 text-brand-foreground">
      <p className="text-[15px] font-semibold">{formatEventStart(startDate, locale)}</p>
      <p className="mt-1 text-xl leading-snug font-extrabold">{title}</p>
      <Button asChild className="mt-4 bg-surface text-ink hover:bg-surface/90">
        <Link href={`/qr?application=${applicationId}`}><QrCode />{t.volunteer.feed.myQr}</Link>
      </Button>
    </section>
  );
}
