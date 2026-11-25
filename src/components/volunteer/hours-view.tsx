"use client";

import Link from "next/link";
import { Award, Clock3, Download, FileBadge2, Medal } from "lucide-react";
import { useLanguage } from "@/components/i18n/language-provider";
import { OrganizationAvatar } from "@/components/organizations/organization-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/datetime";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { fill } from "@/lib/i18n/format";

type Achievement = { id: string; title: string; requiredHours: number };

export type HoursData = {
  totalConfirmed: number;
  pendingHours: number;
  byOrganization: { name: string | null; hours: number }[];
  earnedAchievements: Achievement[];
  nextAchievement: Achievement | null;
  certificates: { id: string; url: string; title: string; date: string }[];
  history: { id: string; title: string; organizationName: string | null; date: string; hours: number; status: string }[];
};

/** Achievement titles live in the database in Russian; the dictionary has all three languages. */
function achievementTitle(achievement: Achievement, t: Dictionary) {
  const key = String(achievement.requiredHours) as keyof typeof t.common.achievements;
  return t.common.achievements[key]?.title ?? achievement.title;
}

function formatHours(value: number, locale: string) {
  return new Intl.NumberFormat(locale === "kk" ? "kk-KZ" : locale === "en" ? "en-US" : "ru-RU", { maximumFractionDigits: 2 }).format(value);
}

export function HoursView({ data }: { data: HoursData }) {
  const { locale, t } = useLanguage();
  const copy = t.volunteer.hours;
  const hours = (value: number) => fill(copy.unit, { count: formatHours(value, locale) });

  if (data.history.length === 0) {
    return (
      <div>
        <h1 className="text-[28px] leading-tight font-extrabold tracking-tight">{copy.title}</h1>
        <EmptyState icon={Clock3} title={copy.emptyTitle} className="mt-5">
          <Button asChild variant="secondary" className="mt-5"><Link href="/dashboard">{copy.openFeed}</Link></Button>
        </EmptyState>
      </div>
    );
  }

  const next = data.nextAchievement;
  const previousThreshold = data.earnedAchievements.at(-1)?.requiredHours ?? 0;
  const progress = next ? Math.min(100, Math.max(0, ((data.totalConfirmed - previousThreshold) / (next.requiredHours - previousThreshold)) * 100)) : 100;

  return (
    <div>
      <h1 className="text-[28px] leading-tight font-extrabold tracking-tight">{copy.title}</h1>

      <section className="mt-5 rounded-card border border-hairline bg-surface p-5">
        <p className="flex items-baseline gap-2">
          <span className="text-5xl leading-none font-extrabold tracking-tight">{formatHours(data.totalConfirmed, locale)}</span>
          <span className="text-[15px] font-semibold text-ink-secondary">{copy.confirmedLabel}</span>
        </p>
        {data.pendingHours > 0 ? <p className="mt-2 text-sm font-semibold text-waiting-foreground">{fill(copy.pending, { count: hours(data.pendingHours) })}</p> : null}
      </section>

      {data.byOrganization.length ? (
        <Section title={copy.byOrganization}>
          <ul className="divide-y divide-hairline rounded-card border border-hairline bg-surface">
            {data.byOrganization.map((row) => (
              <li key={row.name ?? "none"} className="flex min-h-14 items-center gap-3 px-4 py-2.5">
                <OrganizationAvatar name={row.name ?? copy.noOrganization} className="size-9 text-xs" />
                <span className="min-w-0 flex-1 truncate font-semibold">{row.name ?? copy.noOrganization}</span>
                <span className="shrink-0 font-extrabold">{hours(row.hours)}</span>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section title={copy.achievements}>
        <div className="rounded-card border border-hairline bg-surface p-4">
          {data.earnedAchievements.length ? (
            <ul className="flex flex-wrap gap-2">
              {data.earnedAchievements.map((achievement) => (
                <li key={achievement.id} className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-positive px-3 text-sm font-semibold text-positive-foreground">
                  <Medal aria-hidden="true" className="size-4" />{achievementTitle(achievement, t)}
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-ink-secondary">{copy.noAchievements}</p>}
          {next ? (
            <div className="mt-4">
              <p className="flex items-center gap-2 text-sm font-semibold"><Award aria-hidden="true" className="size-4 text-ink-secondary" />{fill(copy.nextAchievement, { title: achievementTitle(next, t), count: formatHours(next.requiredHours - data.totalConfirmed, locale) })}</p>
              <div
                role="progressbar"
                aria-label={fill(copy.progressLabel, { title: achievementTitle(next, t) })}
                aria-valuemin={0}
                aria-valuemax={next.requiredHours}
                aria-valuenow={data.totalConfirmed}
                className="mt-2 h-2 overflow-hidden rounded-full bg-inset"
              >
                <div className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : <p className="mt-3 text-sm font-semibold">{copy.allAchievements}</p>}
        </div>
      </Section>

      <Section title={copy.certificates}>
        {data.certificates.length ? (
          <ul className="grid gap-3">
            {data.certificates.map((certificate) => (
              <li key={certificate.id} className="rounded-card border border-hairline bg-surface p-4 sm:flex sm:items-center sm:gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-inset text-ink"><FileBadge2 aria-hidden="true" className="size-5" /></span>
                  <div className="min-w-0">
                    <p className="font-bold leading-snug">{certificate.title}</p>
                    <p className="text-sm text-ink-secondary">{formatDate(certificate.date, locale, "full")}</p>
                  </div>
                </div>
                <Button asChild variant="secondary" className="mt-3 w-full sm:mt-0 sm:w-auto"><a href={certificate.url} download><Download />{copy.downloadPdf}</a></Button>
              </li>
            ))}
          </ul>
        ) : <p className="rounded-card border border-hairline bg-surface p-4 text-sm text-ink-secondary">{copy.noCertificates}</p>}
      </Section>

      <Section title={copy.history}>
        <ul className="grid gap-3">
          {data.history.map((entry) => (
            <li key={entry.id} className="rounded-card border border-hairline bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 font-bold leading-snug">{entry.title}</p>
                <span className="shrink-0 font-extrabold">{hours(entry.hours)}</span>
              </div>
              <p className="mt-1 text-sm text-ink-secondary">{[entry.organizationName, formatDate(entry.date, locale, "full")].filter(Boolean).join(" · ")}</p>
              <StatusBadge kind="hours" status={entry.status} className="mt-2.5" />
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="mb-3 text-lg font-extrabold">{title}</h2>
      {children}
    </section>
  );
}
