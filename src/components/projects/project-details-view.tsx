"use client";

import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock3, ExternalLink, Laptop, MapPin, ShieldCheck, Users } from "lucide-react";
import { useLanguage } from "@/components/marketing/language-provider";
import { ApplicationButton } from "@/components/projects/application-button";
import { ProjectBenefits } from "@/components/projects/project-benefits";
import { ProjectCover } from "@/components/projects/project-cover";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatLocalizedDate, translateValue } from "@/lib/i18n/marketing-copy";
import { initials } from "@/lib/utils";
import type { ProjectApplication, ProjectWithMeta } from "@/types/app";
import type { UserRole } from "@/types/roles";

type ProjectDetailsViewProps = {
  project: ProjectWithMeta;
  backHref: string;
  userRole?: UserRole;
  application?: ProjectApplication | null;
  whatsappGroupUrl?: string | null;
  unavailable: boolean;
};

export function ProjectDetailsView({ project, backHref, userRole, application, whatsappGroupUrl, unavailable }: ProjectDetailsViewProps) {
  const { locale, copy } = useLanguage();
  const dateOptions: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" };
  const localizedCity = translateValue(project.city, copy.cities);

  return (
    <section className="py-10 sm:py-14">
      <div className="page-shell">
        <Link href={backHref} className="text-sm font-bold text-primary hover:underline">← {copy.project.back}</Link>
        <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_23rem]">
          <div>
            <ProjectCover src={project.cover_url} title={project.title} priority className="aspect-[16/8] rounded-[1.75rem]" />
            <div className="mt-7 flex flex-wrap gap-2">
              <Badge variant="secondary">{translateValue(project.category, copy.categories)}</Badge>
              <StatusBadge status={project.status} />
              <Badge variant="outline">{project.format === "online" ? copy.common.online : copy.common.offline}</Badge>
            </div>
            <h1 className="mt-5 text-balance text-4xl font-black tracking-tight sm:text-5xl">{project.title}</h1>
            <p className="mt-6 whitespace-pre-line text-lg leading-8 text-muted-foreground">{project.description}</p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <Info icon={CalendarDays} label={copy.project.start} value={formatLocalizedDate(project.start_date, locale, dateOptions)} />
              <Info icon={CalendarDays} label={copy.project.end} value={formatLocalizedDate(project.end_date, locale, dateOptions)} />
              <Info icon={project.format === "online" ? Laptop : MapPin} label={project.format === "online" ? copy.project.format : copy.project.place} value={project.format === "online" ? copy.common.online : `${localizedCity}, ${project.address}`} />
              {project.benefits.includes("volunteer_hours") ? <Info icon={Clock3} label={copy.project.volunteerHours} value={`${project.volunteer_hours} ${copy.project.hours}`} /> : null}
            </div>
            <div className="mt-10 rounded-2xl border bg-surface p-6">
              <h2 className="text-xl font-black">{copy.project.provides}</h2>
              <ProjectBenefits benefits={project.benefits} hours={project.volunteer_hours} className="mt-4" />
            </div>
            {project.requirements ? (
              <div className="mt-10 rounded-2xl border bg-surface p-6">
                <h2 className="text-xl font-black">{copy.project.requirements}</h2>
                <div className="mt-4 flex items-start gap-3 text-sm leading-7 text-muted-foreground"><CheckCircle2 className="mt-1 size-5 shrink-0 text-success" /><p className="whitespace-pre-line">{project.requirements}</p></div>
              </div>
            ) : null}
          </div>
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <Metric icon={Users} value={project.participantCount ?? 0} label={copy.project.participants} />
                  <Metric icon={ShieldCheck} value={project.availablePlaces ?? project.required_volunteers} label={copy.project.freePlaces} />
                </div>
                <div className="my-6 border-t" />
                <ApplicationButton projectId={project.id} userRole={userRole} application={application} whatsappGroupUrl={whatsappGroupUrl} disabled={unavailable} />
                <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">{copy.project.reviewNotice}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{copy.project.coordinator}</p>
                <div className="mt-4 flex items-center gap-3">
                  <Avatar className="size-12"><AvatarImage src={project.coordinator?.avatar_url ?? undefined} /><AvatarFallback>{initials(project.coordinator?.full_name)}</AvatarFallback></Avatar>
                  <div><p className="font-black">{project.coordinator?.full_name ?? copy.project.defaultCoordinator}</p><p className="mt-1 text-xs text-muted-foreground">{copy.project.projectCoordinator}</p></div>
                </div>
              </CardContent>
            </Card>
            {project.format === "offline" ? <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${project.city} ${project.address ?? ""}`)}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-sm font-bold text-primary hover:underline">{copy.project.openMap} <ExternalLink className="size-4" /></a> : null}
          </aside>
        </div>
      </div>
    </section>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return <div className="flex items-start gap-3 rounded-2xl bg-surface p-5"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></div><div><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 text-sm font-bold">{value}</p></div></div>;
}

function Metric({ icon: Icon, value, label }: { icon: typeof Users; value: number; label: string }) {
  return <div><Icon className="size-5 text-primary" /><p className="mt-3 text-2xl font-black">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>;
}
