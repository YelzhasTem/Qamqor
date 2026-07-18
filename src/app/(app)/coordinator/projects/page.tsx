import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, FolderKanban, Plus, Users } from "lucide-react";
import { ProjectAdminActions } from "@/components/projects/project-admin-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Управление проектами" };
export default async function CoordinatorProjectsPage() {
  const profile = await requireRole("coordinator");
  const supabase = await createClient();
  const [{ data: projects }, { data: stats }] = await Promise.all([
    supabase.from("projects").select("*").eq("coordinator_id", profile.id).order("created_at", { ascending: false }),
    supabase.from("project_public_stats").select("*"),
  ]);
  const statsMap = new Map((stats ?? []).map((item) => [item.project_id, item]));
  return <div><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><p className="text-sm font-bold text-primary">Координатор</p><h1 className="mt-1 text-3xl font-black tracking-tight">Управление проектами</h1><p className="mt-2 text-sm text-muted-foreground">Создавайте инициативы и управляйте участниками.</p></div><Button asChild><Link href="/coordinator/projects/new"><Plus />Создать проект</Link></Button></div>{projects?.length ? <Card className="mt-7 overflow-hidden"><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Проект</TableHead><TableHead>Дата</TableHead><TableHead>Статус</TableHead><TableHead>Участники</TableHead><TableHead className="text-right">Действия</TableHead></TableRow></TableHeader><TableBody>{projects.map((project) => <TableRow key={project.id}><TableCell><Link href={`/projects/${project.id}`} className="font-black hover:text-primary">{project.title}</Link><p className="mt-1 text-xs text-muted-foreground">{project.city} · {project.category}</p></TableCell><TableCell><span className="flex items-center gap-2 whitespace-nowrap"><CalendarDays className="size-4 text-primary" />{formatDate(project.start_date, "d MMM yyyy")}</span></TableCell><TableCell><StatusBadge status={project.status} /></TableCell><TableCell><span className="flex items-center gap-2"><Users className="size-4 text-primary" />{Number(statsMap.get(project.id)?.participant_count ?? 0)} / {project.required_volunteers}</span></TableCell><TableCell><ProjectAdminActions project={project} /></TableCell></TableRow>)}</TableBody></Table></CardContent></Card> : <div className="mt-7"><EmptyState icon={FolderKanban} title="Создайте первый проект" description="Заполните информацию, сохраните черновик или сразу опубликуйте инициативу." action={{ label: "Создать проект", href: "/coordinator/projects/new" }} /></div>}</div>;
}
