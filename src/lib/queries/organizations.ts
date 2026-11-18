import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type OrganizationMembership = Database["public"]["Tables"]["organization_members"]["Row"];

/** Active organizations, visible to everyone through RLS. */
export async function getActiveOrganizations(): Promise<Organization[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("status", "active")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** The signed-in user's own memberships (RLS returns only their rows). */
export async function getMyMemberships(userId: string): Promise<OrganizationMembership[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_members")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data ?? [];
}

export type LandingProject = {
  id: string;
  title: string;
  category: string;
  coverUrl: string | null;
  startDate: string;
  availablePlaces: number;
  organizationName: string;
};

/** Upcoming published projects that belong to active organizations. */
export async function getLandingProjects(limit = 3): Promise<LandingProject[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, title, category, cover_url, start_date, required_volunteers, organizations!inner(name, status)")
    .eq("status", "published")
    .eq("organizations.status", "active")
    .gte("start_date", new Date().toISOString())
    .order("start_date", { ascending: true })
    .limit(limit);
  if (error) throw error;
  const projects = data ?? [];
  if (!projects.length) return [];

  const { data: stats } = await supabase
    .from("project_public_stats")
    .select("project_id, available_places")
    .in("project_id", projects.map((project) => project.id));
  const places = new Map((stats ?? []).map((row) => [row.project_id, Number(row.available_places ?? 0)]));

  return projects.map((project) => ({
    id: project.id,
    title: project.title,
    category: project.category,
    coverUrl: project.cover_url,
    startDate: project.start_date,
    availablePlaces: places.get(project.id) ?? project.required_volunteers,
    organizationName: project.organizations.name,
  }));
}
