import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { FEED_PAGE_SIZE, toFeedItem, type FeedScope } from "@/lib/queries/volunteer-types";

export { FEED_PAGE_SIZE, toFeedItem };
export type { FeedItem, FeedScope } from "@/lib/queries/volunteer-types";

type ApplicationStatus = Database["public"]["Enums"]["application_status"];
type HoursStatus = Database["public"]["Enums"]["hour_status"];

/** A page of the feed plus whether another page exists. */
export async function getFeedPage(scope: FeedScope, offset = 0) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("volunteer_feed", { scope, page_size: FEED_PAGE_SIZE + 1, page_offset: offset });
  if (error) throw error;
  const rows = (data ?? []).map(toFeedItem);
  return { items: rows.slice(0, FEED_PAGE_SIZE), hasMore: rows.length > FEED_PAGE_SIZE };
}

export type MyApplication = {
  id: string;
  status: ApplicationStatus;
  checkinCode: string | null;
  project: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    status: Database["public"]["Enums"]["project_status"];
    organizationId: string | null;
    organizationName: string | null;
  };
};

/** The signed-in volunteer's own applications with their projects (RLS: own rows only). */
export async function getMyApplications(userId: string): Promise<MyApplication[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_applications")
    .select("id, status, checkin_code, projects!inner(id, title, start_date, end_date, status, organization_id, organizations(name))")
    .eq("volunteer_id", userId);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    status: row.status,
    checkinCode: row.checkin_code,
    project: {
      id: row.projects.id,
      title: row.projects.title,
      startDate: row.projects.start_date,
      endDate: row.projects.end_date,
      status: row.projects.status,
      organizationId: row.projects.organization_id,
      organizationName: row.projects.organizations?.name ?? null,
    },
  }));
}

export function isUpcoming(application: MyApplication, now = Date.now()) {
  return new Date(application.project.endDate).getTime() > now;
}

/** Approved applications to events that have not ended, nearest first. */
export function upcomingApproved(applications: MyApplication[], now = Date.now()) {
  return applications
    .filter((application) => application.status === "approved" && isUpcoming(application, now))
    .sort((a, b) => a.project.startDate.localeCompare(b.project.startDate));
}

export async function getMembershipCount(userId: string) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("organization_members")
    .select("organization_id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) throw error;
  return count ?? 0;
}

export type HoursEntry = {
  id: string;
  hours: number;
  status: HoursStatus;
  createdAt: string;
  project: { id: string; title: string; endDate: string; organizationId: string | null; organizationName: string | null };
};

export async function getMyHours(userId: string): Promise<HoursEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("volunteer_hours")
    .select("id, hours, status, created_at, projects!inner(id, title, end_date, organization_id, organizations(name))")
    .eq("volunteer_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    hours: Number(row.hours),
    status: row.status,
    createdAt: row.created_at,
    project: {
      id: row.projects.id,
      title: row.projects.title,
      endDate: row.projects.end_date,
      organizationId: row.projects.organization_id,
      organizationName: row.projects.organizations?.name ?? null,
    },
  }));
}

export type MyCertificate = { id: string; url: string; issuedAt: string; projectId: string; projectTitle: string; projectEndDate: string };

export async function getMyCertificates(userId: string): Promise<MyCertificate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("certificates")
    .select("id, certificate_url, issued_at, project_id, projects!inner(title, end_date)")
    .eq("volunteer_id", userId)
    .order("issued_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    url: row.certificate_url,
    issuedAt: row.issued_at,
    projectId: row.project_id,
    projectTitle: row.projects.title,
    projectEndDate: row.projects.end_date,
  }));
}
