import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailsView } from "@/components/projects/project-details-view";
import { getCurrentProfile } from "@/lib/auth";
import { getProjectById } from "@/lib/queries/projects";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectById(id);
  return project ? { title: project.title, description: project.description.slice(0, 160) } : { title: "Проект не найден" };
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, profile] = await Promise.all([getProjectById(id), getCurrentProfile()]);
  if (!project) notFound();

  let application = null;
  let whatsappGroupUrl: string | null = null;
  if (profile?.role === "volunteer") {
    const supabase = await createClient();
    const { data } = await supabase.from("project_applications").select("*").eq("project_id", id).eq("volunteer_id", profile.id).maybeSingle();
    application = data;
    if (application && ["pending", "approved", "attended", "completed"].includes(application.status)) {
      const { data: group } = await supabase.from("project_whatsapp_groups").select("whatsapp_group_url").eq("project_id", id).maybeSingle();
      whatsappGroupUrl = group?.whatsapp_group_url ?? null;
    }
  }

  const unavailable = project.status !== "published" || (project.availablePlaces ?? 0) <= 0 || new Date(project.end_date) < new Date();
  return <ProjectDetailsView project={project} backHref={profile ? "/dashboard" : "/projects"} userRole={profile?.role} application={application} whatsappGroupUrl={whatsappGroupUrl} unavailable={unavailable} />;
}
