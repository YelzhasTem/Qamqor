import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock3, UserCheck, UsersRound } from "lucide-react";
import { ApplicationManager, type ManagedApplication } from "@/components/projects/application-manager";
import { StatCard } from "@/components/dashboard/stat-card";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { PublicProfile } from "@/types/app";

export const metadata: Metadata = { title: "Участники проекта" };
export default async function ProjectApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireRole("coordinator");
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase.from("projects").select("*").eq("id", id).eq("coordinator_id", profile.id).maybeSingle();
  if (!project) notFound();
  const [{ data: applications }, { data: hours }] = await Promise.all([
    supabase.from("project_applications").select("*").eq("project_id", id).order("applied_at", { ascending: false }),
    supabase.from("volunteer_hours").select("*").eq("project_id", id),
  ]);
  const volunteerIds = [...new Set((applications ?? []).map((item) => item.volunteer_id))];
  const { data: volunteers } = volunteerIds.length ? await supabase.from("public_profiles").select("*").in("id", volunteerIds) : { data: [] as PublicProfile[] };
  const volunteerMap = new Map((volunteers ?? []).map((item) => [item.id, item]));
  const hoursMap = new Map((hours ?? []).map((item) => [item.volunteer_id, item]));
  const managed: ManagedApplication[] = (applications ?? []).map((item) => ({ ...item, volunteer: volunteerMap.get(item.volunteer_id) ?? null, hours: hoursMap.get(item.volunteer_id) ?? null }));
  return <div><Link href="/coordinator/projects" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"><ArrowLeft className="size-4" />К проектам</Link><div className="mt-5"><p className="text-sm font-bold text-primary">Управление заявками</p><h1 className="mt-1 text-3xl font-black tracking-tight">{project.title}</h1><p className="mt-2 text-sm text-muted-foreground">Принимайте участников, отмечайте посещение и подтверждайте фактические часы.</p></div><div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Всего заявок" value={managed.length} icon={UsersRound} /><StatCard label="Новые" value={managed.filter((item) => item.status === "pending").length} icon={UserCheck} tone="accent" /><StatCard label="Одобрено" value={managed.filter((item) => ["approved", "attended", "completed"].includes(item.status)).length} icon={CheckCircle2} tone="success" /><StatCard label="Часы подтверждены" value={(hours ?? []).filter((item) => item.status === "confirmed").reduce((sum, item) => sum + Number(item.hours), 0)} icon={Clock3} tone="success" /></div><div className="mt-7"><ApplicationManager applications={managed} projectHours={project.volunteer_hours} /></div></div>;
}
