import { FeedCardSkeleton } from "@/components/volunteer/feed-project-card";

/** Feed skeleton while the first page loads. */
export default function DashboardLoading() {
  return (
    <div aria-busy="true">
      <div className="h-9 w-32 animate-pulse rounded-control bg-inset" />
      <div className="mt-2 h-5 w-56 animate-pulse rounded-control bg-inset" />
      <div className="mt-5 h-[52px] animate-pulse rounded-row bg-inset" />
      <div className="mt-5 grid gap-4"><FeedCardSkeleton /><FeedCardSkeleton /></div>
    </div>
  );
}
