import Link from "next/link";
import { FolderKanban, Send, UserCheck, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { ProjectStatusChart } from "@/components/dashboard/project-status-chart";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/types/app";

export async function CoordinatorDashboard({ profile }: { profile: Profile }) {
  const supabase = await createClient();
  const [{ data: projects }, { data: applications }] = await Promise.all([
    supabase.from("projects").select("*").eq("coordinator_id", profile.id).order("created_at", { ascending: false }),
    supabase.from("project_applications").select("*, projects!inner(id,title,coordinator_id)").eq("projects.coordinator_id", profile.id).order("applied_at", { ascending: false }),
  ]);
  const uniqueVolunteers = new Set((applications ?? []).map((item) => item.volunteer_id)).size;
  const pending = (applications ?? []).filter((item) => item.status === "pending");
  const chart = ["draft", "published", "completed"].map((status) => ({ name: status === "draft" ? "Черновики" : status === "published" ? "Активные" : "Завершённые", value: (projects ?? []).filter((project) => project.status === status).length }));
  return <div><div><p className="text-sm font-bold text-primary">Кабинет координатора</p><h1 className="mt-1 text-3xl font-black tracking-tight">Управляйте добрыми делами</h1><p className="mt-2 text-sm text-muted-foreground">Проекты, волонтёры и новые заявки — в одном месте.</p></div><div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Всего проектов" value={projects?.length ?? 0} icon={FolderKanban} /><StatCard label="Опубликовано" value={(projects ?? []).filter((p) => p.status === "published").length} icon={Send} tone="info" /><StatCard label="Волонтёров" value={uniqueVolunteers} icon={UsersRound} tone="success" /><StatCard label="Новые заявки" value={pending.length} icon={UserCheck} tone="accent" /></div><div className="mt-7 grid gap-6 xl:grid-cols-[.8fr_1.2fr]"><Card><CardHeader><CardTitle>Статусы проектов</CardTitle></CardHeader><CardContent><ProjectStatusChart data={chart} /></CardContent></Card><Card><CardHeader className="flex-row items-center justify-between"><CardTitle>Новые заявки</CardTitle><Button asChild variant="ghost" size="sm"><Link href="/coordinator/projects">Все проекты</Link></Button></CardHeader><CardContent>{pending.length ? <div className="grid gap-3">{pending.slice(0, 5).map((item) => <Link key={item.id} href={`/coordinator/projects/${item.project_id}/applications`} className="flex items-center gap-4 rounded-xl border p-4 transition hover:bg-primary/5"><div className="flex size-10 items-center justify-center rounded-xl bg-warning/15 text-warning-foreground"><UserCheck className="size-5" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{item.projects?.title}</p><p className="mt-1 text-xs text-muted-foreground">{formatDate(item.applied_at, "d MMM, HH:mm")}</p></div><StatusBadge status={item.status} /></Link>)}</div> : <EmptyState title="Новых заявок нет" description="Когда волонтёры откликнутся, заявки появятся здесь." />}</CardContent></Card></div></div>;
}
