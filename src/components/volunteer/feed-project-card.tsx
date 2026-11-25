"use client";

import Link from "next/link";
import { useLanguage } from "@/components/i18n/language-provider";
import { ProjectCover } from "@/components/projects/project-cover";
import { ChipLabel } from "@/components/shared/chip";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCardMoment } from "@/lib/datetime";
import { plural, translateValue } from "@/lib/i18n/format";
import type { FeedItem } from "@/lib/queries/volunteer-types";

/** One project in the feed. The whole card is a link to the project page. */
export function FeedProjectCard({ item }: { item: FeedItem }) {
  const { locale, t } = useLanguage();
  const copy = t.volunteer.feed;
  const full = item.availablePlaces <= 0;
  const moment = formatCardMoment(item.startDate, locale);
  const places = full ? null : plural(locale, item.availablePlaces, copy.freePlaces);

  return (
    <article className="overflow-hidden rounded-card border border-hairline bg-surface transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand hover:border-control">
      <Link href={`/projects/${item.projectId}`} className="block outline-none">
        <ProjectCover src={item.coverUrl} title={item.title} className="h-[150px]" />
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <ChipLabel>{translateValue(item.category, t.common.categories)}</ChipLabel>
            <span className="min-w-0 truncate text-[13px] font-medium text-ink-secondary">{item.organizationName}</span>
          </div>
          <h2 className="mt-2.5 text-[17px] leading-snug font-extrabold">{item.title}</h2>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="min-w-0 text-[14px] leading-5 text-ink-secondary">
              {moment}
              {places ? <> · {places}</> : null}
            </p>
            {item.applicationStatus ? (
              <StatusBadge kind="application" status={item.applicationStatus} />
            ) : full ? (
              <span className="shrink-0 text-[13px] font-semibold text-ink-secondary">{copy.noPlaces}</span>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}

export function FeedCardSkeleton() {
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-card border border-hairline bg-surface">
      <div className="h-[150px] animate-pulse bg-inset" />
      <div className="grid gap-2.5 p-4">
        <div className="h-7 w-28 animate-pulse rounded-full bg-inset" />
        <div className="h-5 w-4/5 animate-pulse rounded-control bg-inset" />
        <div className="h-4 w-3/5 animate-pulse rounded-control bg-inset" />
      </div>
    </div>
  );
}
