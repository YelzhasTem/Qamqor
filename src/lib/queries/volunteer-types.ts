// Types and mapping shared by server queries and client components.
import type { Database } from "@/types/database";

type ApplicationStatus = Database["public"]["Enums"]["application_status"];

export const FEED_PAGE_SIZE = 20;
export type FeedScope = "mine" | "all";

/** One feed card, as returned by public.volunteer_feed (security invoker, RLS applies). */
export type FeedItem = {
  projectId: string;
  title: string;
  category: string;
  coverUrl: string | null;
  startDate: string;
  endDate: string;
  capacity: number;
  availablePlaces: number;
  organizationId: string;
  organizationName: string;
  applicationId: string | null;
  applicationStatus: ApplicationStatus | null;
};

type FeedRow = Database["public"]["Functions"]["volunteer_feed"]["Returns"][number];

export function toFeedItem(row: FeedRow): FeedItem {
  return {
    projectId: row.project_id,
    title: row.title,
    category: row.category,
    coverUrl: row.cover_url ?? null,
    startDate: row.start_date,
    endDate: row.end_date,
    capacity: Number(row.capacity),
    availablePlaces: Number(row.available_places ?? 0),
    organizationId: row.organization_id,
    organizationName: row.organization_name,
    applicationId: row.application_id ?? null,
    applicationStatus: (row.application_status as ApplicationStatus | null) ?? null,
  };
}

