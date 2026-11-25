import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailsView } from "@/components/projects/project-details-view";
import { getCurrentProfile } from "@/lib/auth";
import { getServerDictionary } from "@/lib/i18n/server";
import { getProjectById } from "@/lib/queries/projects";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const [project, { t }] = await Promise.all([getProjectById(id), getServerDictionary()]);
  return project ? { title: project.title, description: project.description.slice(0, 160) } : { title: t.volunteer.project.notFoundTitle };
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, profile] = await Promise.all([getProjectById(id), getCurrentProfile()]);
  if (!project) notFound();

  const supabase = await createClient();
  const organization = project.organization_id
    ? (await supabase.from("organizations").select("id, name, logo_url, status").eq("id", project.organization_id).maybeSingle()).data
    : null;

  let application: { id: string; status: string } | null = null;
  let isMember = false;
  let whatsappGroupUrl: string | null = null;
  if (profile) {
    const [applicationResult, membershipResult, groupResult] = await Promise.all([
      supabase.from("project_applications").select("id, status").eq("project_id", id).eq("volunteer_id", profile.id).maybeSingle(),
      project.organization_id
        ? supabase.from("organization_members").select("role").eq("organization_id", project.organization_id).eq("user_id", profile.id).maybeSingle()
        : Promise.resolve({ data: null }),
      // Returned only when the existing RLS policy allows it (owner or a current application).
      supabase.from("project_whatsapp_groups").select("whatsapp_group_url").eq("project_id", id).maybeSingle(),
    ]);
    application = applicationResult.data;
    isMember = Boolean(membershipResult.data);
    whatsappGroupUrl = groupResult.data?.whatsapp_group_url ?? null;
  }

  // An organization hidden after publishing closes the project, like a finished one.
  const open = project.status === "published"
    && new Date(project.end_date).getTime() > Date.now()
    && (!project.organization_id || organization?.status === "active");

  return (
    <ProjectDetailsView
      project={{
        id: project.id,
        title: project.title,
        description: project.description,
        requirements: project.requirements,
        category: project.category,
        coverUrl: project.cover_url,
        format: project.format,
        city: project.city,
        address: project.address,
        startDate: project.start_date,
        endDate: project.end_date,
        capacity: project.required_volunteers,
        availablePlaces: project.availablePlaces ?? project.required_volunteers,
        volunteerHours: Number(project.volunteer_hours),
        benefits: project.benefits,
        open,
      }}
      organization={organization ? { name: organization.name, logoUrl: organization.logo_url } : null}
      viewer={profile ? { role: profile.role, isMember } : null}
      initialApplication={application}
      whatsappGroupUrl={whatsappGroupUrl}
    />
  );
}
