import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/forms/project-form";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Редактирование проекта" };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireRole("coordinator");
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: project }, { data: whatsappGroup }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).eq("coordinator_id", profile.id).maybeSingle(),
    supabase.from("project_whatsapp_groups").select("whatsapp_group_url").eq("project_id", id).maybeSingle(),
  ]);

  if (!project) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-sm font-bold text-primary">Управление проектом</p>
      <h1 className="mt-1 text-3xl font-black tracking-tight">Редактирование</h1>
      <p className="mt-2 text-sm text-muted-foreground">Изменения опубликованного проекта сразу увидят волонтёры.</p>
      <div className="mt-7">
        <ProjectForm project={project} whatsappGroupUrl={whatsappGroup?.whatsapp_group_url ?? ""} />
      </div>
    </div>
  );
}
