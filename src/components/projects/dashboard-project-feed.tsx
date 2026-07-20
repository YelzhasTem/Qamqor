import Link from "next/link";
import { CalendarDays, Clock3, MapPin, Users } from "lucide-react";
import { ProjectBenefits } from "@/components/projects/project-benefits";
import { ProjectCover } from "@/components/projects/project-cover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { clampText, formatDate } from "@/lib/utils";
import type { ProjectWithMeta } from "@/types/app";

export function DashboardProjectFeed({ projects }: { projects: ProjectWithMeta[] }) {
  return (
    <div className="grid gap-5">
      {projects.map((project, index) => (
        <Card key={project.id} className="group overflow-hidden transition duration-300 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/10">
          <CardContent className="grid p-0 md:grid-cols-[18rem_minmax(0,1fr)] lg:grid-cols-[22rem_minmax(0,1fr)]">
            <ProjectCover
              src={project.cover_url}
              title={project.title}
              priority={index === 0}
              className="aspect-[16/9] h-full min-h-52 md:aspect-auto"
            />
            <div className="flex min-w-0 flex-col p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{project.category}</Badge>
                <Badge variant="outline">{project.format === "online" ? "Онлайн" : "Офлайн"}</Badge>
                {new Date(project.end_date) < new Date() ? <Badge variant="muted">Прошедший</Badge> : null}
              </div>

              <h2 className="mt-4 text-2xl font-black tracking-tight">
                <Link href={`/projects/${project.id}`} className="transition hover:text-primary">
                  {project.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {clampText(project.description, 220)}
              </p>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-muted-foreground">
                <span className="flex items-center gap-2"><CalendarDays className="size-4 text-primary" />{formatDate(project.start_date, "d MMMM, HH:mm")}</span>
                <span className="flex items-center gap-2"><MapPin className="size-4 text-primary" />{project.format === "online" ? "Онлайн" : project.city}</span>
                {project.benefits.includes("volunteer_hours") ? <span className="flex items-center gap-2"><Clock3 className="size-4 text-primary" />{project.volunteer_hours} ВЧ</span> : null}
                <span className="flex items-center gap-2"><Users className="size-4 text-primary" />{project.availablePlaces ?? project.required_volunteers} мест</span>
              </div>

              <ProjectBenefits benefits={project.benefits} hours={project.volunteer_hours} className="mt-5" />

              <div className="mt-6 flex items-center justify-between gap-4 border-t pt-5">
                <p className="truncate text-xs text-muted-foreground">
                  Координатор: <span className="font-bold text-foreground">{project.coordinator?.full_name ?? "Qamqor"}</span>
                </p>
                <Button asChild size="sm">
                  <Link href={`/projects/${project.id}`}>Подробнее</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
