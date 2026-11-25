"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Loader2, SearchX } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/components/i18n/language-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { SegmentedControl } from "@/components/shared/segmented-control";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FeedCardSkeleton, FeedProjectCard } from "@/components/volunteer/feed-project-card";
import { NextEventCard } from "@/components/volunteer/next-event-card";
import { createClient } from "@/lib/supabase/client";
import { initials } from "@/lib/utils";
import { FEED_PAGE_SIZE as PAGE_SIZE, toFeedItem, type FeedItem, type FeedScope } from "@/lib/queries/volunteer-types";


export function FeedView({
  scope,
  initialItems,
  initialHasMore,
  membershipCount,
  nextEvent,
  profile,
}: {
  scope: FeedScope;
  initialItems: FeedItem[];
  initialHasMore: boolean;
  membershipCount: number;
  nextEvent: { applicationId: string; title: string; startDate: string } | null;
  profile: { fullName: string; avatarUrl: string | null };
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const copy = t.volunteer.feed;
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const [switching, startSwitch] = useTransition();
  const [shownScope, setShownScope] = useState(scope);

  function selectScope(next: FeedScope) {
    setShownScope(next);
    startSwitch(() => router.replace(next === "all" ? "/dashboard?tab=all" : "/dashboard", { scroll: false }));
  }

  async function loadMore() {
    setLoadingMore(true);
    const { data, error } = await createClient().rpc("volunteer_feed", { scope, page_size: PAGE_SIZE + 1, page_offset: items.length });
    setLoadingMore(false);
    if (error) {
      toast.error(copy.loadError);
      return;
    }
    const rows = (data ?? []).map(toFeedItem);
    setItems((current) => [...current, ...rows.slice(0, PAGE_SIZE)]);
    setHasMore(rows.length > PAGE_SIZE);
  }

  const loading = switching;

  return (
    <div>
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[28px] leading-tight font-extrabold tracking-tight">{copy.title}</h1>
          <p className="mt-1 text-[15px] leading-6 text-ink-secondary">{shownScope === "all" ? copy.leadAll : copy.leadMine}</p>
        </div>
        <Link href="/profile" aria-label={copy.profileLink} className="shrink-0 rounded-full">
          <Avatar className="size-11">
            <AvatarImage src={profile.avatarUrl ?? undefined} alt="" />
            <AvatarFallback>{initials(profile.fullName)}</AvatarFallback>
          </Avatar>
        </Link>
      </header>

      <SegmentedControl
        label={copy.tabsLabel}
        value={shownScope}
        onChange={selectScope}
        options={[{ value: "mine", label: copy.tabMine }, { value: "all", label: copy.tabAll }]}
        className="mt-5 flex w-full"
      />

      {nextEvent ? <div className="mt-5"><NextEventCard {...nextEvent} /></div> : null}

      <div className="mt-5" aria-busy={loading}>
        {loading ? (
          <div className="grid gap-4"><FeedCardSkeleton /><FeedCardSkeleton /><FeedCardSkeleton /></div>
        ) : items.length ? (
          <>
            <ul className="grid gap-4">
              {items.map((item) => <li key={item.projectId}><FeedProjectCard item={item} /></li>)}
            </ul>
            {hasMore ? (
              <div className="mt-5 flex justify-center">
                <Button variant="secondary" size="lg" onClick={() => void loadMore()} disabled={loadingMore} className="w-full sm:w-auto">
                  {loadingMore ? <Loader2 className="animate-spin" /> : null}
                  {copy.showMore}
                </Button>
              </div>
            ) : null}
          </>
        ) : scope === "mine" && membershipCount === 0 ? (
          <EmptyState icon={Building2} title={copy.noMembershipsTitle} description={copy.noMembershipsText}>
            <Button asChild variant="brand" className="mt-5"><Link href="/organizations?next=/dashboard">{copy.chooseOrganizations}</Link></Button>
          </EmptyState>
        ) : scope === "mine" ? (
          <EmptyState icon={SearchX} title={copy.noOrgProjectsTitle} description={copy.noOrgProjectsText}>
            <Button variant="secondary" className="mt-5" onClick={() => selectScope("all")}>{copy.showAll}</Button>
          </EmptyState>
        ) : (
          <EmptyState icon={SearchX} title={copy.noProjectsTitle} description={copy.noProjectsText} />
        )}
      </div>
    </div>
  );
}
