import { FeedView } from "@/components/volunteer/feed-view";
import { getFeedPage, getMembershipCount, getMyApplications, upcomingApproved, type FeedScope } from "@/lib/queries/volunteer";
import type { Profile } from "@/types/app";

/** Server half of the volunteer feed (/dashboard). */
export async function VolunteerFeedPage({ profile, scope }: { profile: Profile; scope: FeedScope }) {
  const [page, membershipCount, applications] = await Promise.all([
    getFeedPage(scope),
    getMembershipCount(profile.id),
    getMyApplications(profile.id),
  ]);
  const [next] = upcomingApproved(applications);

  return (
    <FeedView
      key={scope}
      scope={scope}
      initialItems={page.items}
      initialHasMore={page.hasMore}
      membershipCount={membershipCount}
      nextEvent={next ? { applicationId: next.id, title: next.project.title, startDate: next.project.startDate } : null}
      profile={{ fullName: profile.full_name, avatarUrl: profile.avatar_url }}
    />
  );
}
