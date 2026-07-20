import type { Metadata } from "next";
import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";
import { DashboardProjectFeed } from "@/components/projects/dashboard-project-feed";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth";
import { getDashboardProjects } from "@/lib/queries/projects";
import { isCoordinatorRole } from "@/types/roles";

export const metadata: Metadata = { title: "Дашборд проектов" };

export default async function DashboardPage() {
  const [profile, projects] = await Promise.all([getCurrentProfile(), getDashboardProjects()]);
  const canCreate = profile ? isCoordinatorRole(profile.role) : false;

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold text-primary">Дашборд</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Проекты Qamqor</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Все опубликованные проекты в одной ленте. Просматривайте список и открывайте подробности интересующих инициатив.
          </p>
        </div>
        {canCreate ? (
          <Button asChild>
            <Link href="/coordinator/projects/new"><Plus />Создать проект</Link>
          </Button>
        ) : null}
      </div>

      <div className="mt-7">
        {projects.length ? (
          <DashboardProjectFeed projects={projects} />
        ) : (
          <EmptyState
            icon={FolderKanban}
            title="Опубликованных проектов пока нет"
            description={canCreate ? "Создайте первый проект и опубликуйте его — он появится здесь для всех пользователей." : "Как только координатор опубликует проект, он появится в этой ленте."}
            action={canCreate ? { label: "Создать проект", href: "/coordinator/projects/new" } : undefined}
          />
        )}
      </div>
    </div>
  );
}
