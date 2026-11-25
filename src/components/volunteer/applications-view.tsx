"use client";

import Link from "next/link";
import { CalendarCheck2, ClipboardList, Download, QrCode } from "lucide-react";
import { useLanguage } from "@/components/i18n/language-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { CancelApplicationButton } from "@/components/volunteer/cancel-application";
import { UrlSegmentedControl } from "@/components/volunteer/url-segmented-control";
import { formatDate, formatDateTime } from "@/lib/datetime";
import { fill } from "@/lib/i18n/format";

export type ApplicationCard = {
  id: string;
  status: string;
  projectId: string;
  title: string;
  organizationName: string | null;
  startDate: string;
  hours: { hours: number; status: string } | null;
  certificateUrl: string | null;
};

export function ApplicationsView({ tab, items }: { tab: "upcoming" | "past"; items: ApplicationCard[] }) {
  const { locale, t } = useLanguage();
  const copy = t.volunteer.applications;

  return (
    <div>
      <h1 className="text-[28px] leading-tight font-extrabold tracking-tight">{copy.title}</h1>
      <UrlSegmentedControl
        label={copy.tabsLabel}
        value={tab}
        options={[
          { value: "upcoming", label: copy.upcoming, href: "/applications" },
          { value: "past", label: copy.past, href: "/applications?tab=past" },
        ]}
        className="mt-5 flex w-full"
      />

      <div className="mt-5">
        {items.length === 0 ? (
          tab === "upcoming" ? (
            <EmptyState icon={ClipboardList} title={copy.emptyTitle} description={copy.emptyText}>
              <Button asChild variant="secondary" className="mt-5"><Link href="/dashboard">{copy.openFeed}</Link></Button>
            </EmptyState>
          ) : (
            <EmptyState icon={CalendarCheck2} title={copy.emptyPastTitle} />
          )
        ) : (
          <ul className="grid gap-3">
            {items.map((item) => (
              <li key={item.id} className="rounded-card border border-hairline bg-surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <StatusBadge kind="application" status={item.status} />
                  <span className="text-right text-[13px] font-semibold text-ink-secondary">
                    {tab === "upcoming" ? formatDateTime(item.startDate, locale) : formatDate(item.startDate, locale, "full")}
                  </span>
                </div>
                <h2 className="mt-3 text-[17px] leading-snug font-extrabold">
                  <Link href={`/projects/${item.projectId}`} className="rounded-control underline-offset-4 hover:underline">{item.title}</Link>
                </h2>
                {item.organizationName ? <p className="mt-1 text-sm text-ink-secondary">{item.organizationName}</p> : null}

                {tab === "upcoming" ? (
                  <UpcomingActions item={item} />
                ) : (
                  <>
                    {item.hours ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold">
                        <span>{fill(copy.hoursLine, { count: fill(t.volunteer.hours.unit, { count: item.hours.hours }) })}</span>
                        <StatusBadge kind="hours" status={item.hours.status} />
                      </div>
                    ) : null}
                    {item.certificateUrl ? (
                      <Button asChild variant="secondary" className="mt-3">
                        <a href={item.certificateUrl} download><Download />{copy.downloadCertificate}</a>
                      </Button>
                    ) : null}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function UpcomingActions({ item }: { item: ApplicationCard }) {
  const { t } = useLanguage();
  const copy = t.volunteer.applications;
  if (item.status === "approved") {
    return (
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild variant="brand"><Link href={`/qr?application=${item.id}`}><QrCode />{copy.myQr}</Link></Button>
        <CancelApplicationButton applicationId={item.id} projectId={item.projectId} label={copy.cancel} />
      </div>
    );
  }
  if (item.status === "pending") {
    return <div className="mt-4"><CancelApplicationButton applicationId={item.id} projectId={item.projectId} label={copy.cancelApplication} /></div>;
  }
  if (item.status === "rejected") {
    return <Button asChild variant="link" className="mt-3"><Link href="/dashboard">{copy.findSimilar}</Link></Button>;
  }
  if (item.status === "attended") {
    return <Button asChild variant="secondary" className="mt-4"><Link href={`/qr?application=${item.id}`}><QrCode />{copy.myQr}</Link></Button>;
  }
  return null;
}
