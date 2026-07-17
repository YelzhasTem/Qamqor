import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Project, ProjectWithMeta, PublicProfile } from "@/types/app";

export async function getPlatformStats() {
  const supabase = await createClient();
  const { data } = await supabase.from("platform_stats").select("*").maybeSingle();
  return { volunteers: Number(data?.volunteers ?? 0), projects: Number(data?.projects ?? 0), confirmedHours: Number(data?.confirmed_hours ?? 0) };
}

async function enrichProjects(projects: Project[]): Promise<ProjectWithMeta[]> {
  if (!projects.length) return [];
  const supabase = await createClient();
  const coordinatorIds = [...new Set(projects.map((project) => project.coordinator_id))];
  const projectIds = projects.map((project) => project.id);
  const [{ data: coordinators }, { data: stats }] = await Promise.all([
    supabase.from("public_profiles").select("*").in("id", coordinatorIds),
    supabase.from("project_public_stats").select("*").in("project_id", projectIds),
  ]);
  const coordinatorMap = new Map((coordinators ?? []).map((item) => [item.id, item as PublicProfile]));
  const statsMap = new Map((stats ?? []).map((item) => [item.project_id, item]));
  return projects.map((project) => ({
    ...project,
    coordinator: coordinatorMap.get(project.coordinator_id) ?? null,
    participantCount: Number(statsMap.get(project.id)?.participant_count ?? 0),
    availablePlaces: Number(statsMap.get(project.id)?.available_places ?? project.required_volunteers),
  }));
}

export async function getPopularProjects(limit = 3) {
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("*").eq("status", "published").gte("end_date", new Date().toISOString()).order("start_date", { ascending: true }).limit(limit);
  return enrichProjects(data ?? []);
}

export type ProjectFilters = { q?: string; city?: string; category?: string; format?: string; sort?: string; page?: number };
export async function getProjectCatalog(filters: ProjectFilters, pageSize = 9) {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  let query = supabase.from("projects").select("*", { count: "exact" }).eq("status", "published");
  if (filters.q) {
    const q = filters.q.replace(/[%_,()]/g, " ").trim();
    if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,city.ilike.%${q}%,category.ilike.%${q}%`);
  }
  if (filters.city) query = query.eq("city", filters.city);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.format === "online" || filters.format === "offline") query = query.eq("format", filters.format);
  if (filters.sort === "newest") query = query.order("created_at", { ascending: false });
  else if (filters.sort === "hours") query = query.order("volunteer_hours", { ascending: false });
  else query = query.order("start_date", { ascending: true });
  const from = (page - 1) * pageSize;
  const { data, count, error } = await query.range(from, from + pageSize - 1);
  if (error) throw error;

  const { data: facets } = await supabase.from("projects").select("city, category").eq("status", "published").limit(500);
  return {
    projects: await enrichProjects(data ?? []),
    count: count ?? 0,
    page,
    pageSize,
    cities: [...new Set((facets ?? []).map((item) => item.city))].sort(),
    categories: [...new Set((facets ?? []).map((item) => item.category))].sort(),
  };
}

export async function getProjectById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  const [project] = await enrichProjects([data]);
  return project ?? null;
}
