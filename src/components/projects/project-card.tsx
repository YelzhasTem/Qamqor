import Link from "next/link";
import { CalendarDays, Clock3, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectCover } from "@/components/projects/project-cover";
import { ProjectBenefits } from "@/components/projects/project-benefits";
import { clampText, formatDate } from "@/lib/utils";
import type { ProjectWithMeta } from "@/types/app";

export function ProjectCard({ project }: { project: ProjectWithMeta }) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/10">
      <ProjectCover src={project.cover_url} title={project.title} className="aspect-[16/9]" />
      <CardContent className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3"><Badge variant="secondary">{project.category}</Badge><span className="text-xs font-semibold text-muted-foreground">{project.format === "online" ? "Онлайн" : "Офлайн"}</span></div>
        <h3 className="mt-4 text-lg font-black leading-6 tracking-tight"><Link href={`/projects/${project.id}`} className="hover:text-primary">{project.title}</Link></h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{clampText(project.description, 115)}</p>
        <ProjectBenefits benefits={project.benefits} hours={project.volunteer_hours} className="mt-4" />
        <div className="mt-5 grid grid-cols-2 gap-3 text-xs font-semibold text-muted-foreground"><span className="flex items-center gap-1.5"><CalendarDays className="size-4 text-primary" />{formatDate(project.start_date, "d MMM")}</span><span className="flex items-center gap-1.5"><MapPin className="size-4 text-primary" />{project.city}</span><span className="flex items-center gap-1.5"><Clock3 className="size-4 text-primary" />{project.volunteer_hours} ч.</span><span className="flex items-center gap-1.5"><Users className="size-4 text-primary" />{project.availablePlaces ?? project.required_volunteers} мест</span></div>
        <Button asChild variant="outline" className="mt-5 w-full"><Link href={`/projects/${project.id}`}>Подробнее</Link></Button>
      </CardContent>
    </Card>
  );
}
