import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Clock3, ExternalLink, FolderSearch, MapPin, MessageCircle } from "lucide-react";
import { CancelApplicationButton } from "@/components/projects/cancel-application-button";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Project, ProjectApplication, ProjectWhatsAppGroup, VolunteerHours } from "@/types/app";

export const metadata: Metadata = { title: "Моё участие" };

export default async function MyProjectsPage() {
  const profile = await requireRole("volunteer");
  const supabase = await createClient();
  const [{ data: applications }, { data: hours }, { data: whatsappGroups }] = await Promise.all([
    supabase.from("project_applications").select("*, projects(id,title,city,start_date,end_date,volunteer_hours,category)").eq("volunteer_id", profile.id).order("applied_at", { ascending: false }),
    supabase.from("volunteer_hours").select("project_id,hours,status").eq("volunteer_id", profile.id),
    supabase.from("project_whatsapp_groups").select("project_id,whatsapp_group_url"),
  ]);

  const hoursMap = new Map((hours ?? []).map((item) => [item.project_id, item]));
  const groupMap = new Map((whatsappGroups ?? []).map((item) => [item.project_id, item.whatsapp_group_url]));
  const groups = {
    applications: (applications ?? []).filter((item) => ["pending", "rejected"].includes(item.status)),
    active: (applications ?? []).filter((item) => ["approved", "attended"].includes(item.status)),
    completed: (applications ?? []).filter((item) => item.status === "completed"),
  };

  return (
    <div>
      <p className="text-sm font-bold text-primary">Волонтёрская активность</p>
      <h1 className="mt-1 text-3xl font-black tracking-tight">Моё участие</h1>
      <p className="mt-2 text-sm text-muted-foreground">Следите за заявками, активными событиями и завершёнными проектами.</p>
      <Tabs defaultValue="applications" className="mt-8">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="applications">Заявки ({groups.applications.length})</TabsTrigger>
          <TabsTrigger value="active">Активные ({groups.active.length})</TabsTrigger>
          <TabsTrigger value="completed">Завершённые ({groups.completed.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="applications"><ProjectList items={groups.applications} hoursMap={hoursMap} groupMap={groupMap} empty="У вас пока нет заявок" canCancel /></TabsContent>
        <TabsContent value="active"><ProjectList items={groups.active} hoursMap={hoursMap} groupMap={groupMap} empty="Нет активных проектов" canCancel /></TabsContent>
        <TabsContent value="completed"><ProjectList items={groups.completed} hoursMap={hoursMap} groupMap={groupMap} empty="Завершённых проектов пока нет" /></TabsContent>
      </Tabs>
    </div>
  );
}

type MyProjectItem = ProjectApplication & {
  projects: Pick<Project, "id" | "title" | "city" | "start_date" | "end_date" | "volunteer_hours" | "category"> | null;
};
type HoursItem = Pick<VolunteerHours, "project_id" | "hours" | "status">;
type GroupMap = Map<ProjectWhatsAppGroup["project_id"], ProjectWhatsAppGroup["whatsapp_group_url"]>;

function ProjectList({
  items,
  hoursMap,
  groupMap,
  empty,
  canCancel = false,
}: {
  items: MyProjectItem[];
  hoursMap: Map<string, HoursItem>;
  groupMap: GroupMap;
  empty: string;
  canCancel?: boolean;
}) {
  if (!items.length) {
    return <EmptyState icon={FolderSearch} title={empty} description="Откройте дашборд, чтобы найти подходящую инициативу." action={{ label: "Найти проект", href: "/dashboard" }} />;
  }

  return (
    <div className="grid gap-4">
      {items.map((item) => {
        const project = item.projects;
        const loggedHours = hoursMap.get(item.project_id);
        const whatsappGroupUrl = groupMap.get(item.project_id);

        return (
          <Card key={item.id}>
            <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
              <div className="flex size-13 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><CalendarDays /></div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/projects/${item.project_id}`} className="truncate font-black hover:text-primary">{project?.title}</Link>
                  <StatusBadge status={item.status} />
                </div>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" />{project ? formatDate(project.start_date, "d MMMM yyyy") : "—"}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="size-3.5" />{project?.city}</span>
                  <span className="flex items-center gap-1.5"><Clock3 className="size-3.5" />{loggedHours ? `${loggedHours.hours} ч. (${loggedHours.status})` : `${project?.volunteer_hours ?? 0} ч.`}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {whatsappGroupUrl ? (
                  <Button asChild size="sm" className="bg-success text-white hover:bg-success/90">
                    <a href={whatsappGroupUrl} target="_blank" rel="noreferrer"><MessageCircle />WhatsApp<ExternalLink className="size-3.5" /></a>
                  </Button>
                ) : null}
                <Button asChild variant="outline" size="sm"><Link href={`/projects/${item.project_id}`}>Открыть</Link></Button>
                {canCancel && ["pending", "approved"].includes(item.status) ? <CancelApplicationButton applicationId={item.id} projectId={item.project_id} /> : null}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
