import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock3, ExternalLink, Laptop, MapPin, ShieldCheck, Users } from "lucide-react";
import { ApplicationButton } from "@/components/projects/application-button";
import { ProjectBenefits } from "@/components/projects/project-benefits";
import { ProjectCover } from "@/components/projects/project-cover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getCurrentProfile } from "@/lib/auth";
import { getProjectById } from "@/lib/queries/projects";
import { createClient } from "@/lib/supabase/server";
import { formatDate, initials } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectById(id);
  return project ? { title: project.title, description: project.description.slice(0, 160) } : { title: "Проект не найден" };
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, profile] = await Promise.all([getProjectById(id), getCurrentProfile()]);
  if (!project) notFound();
  let application = null;
  if (profile?.role === "volunteer") {
    const supabase = await createClient();
    const { data } = await supabase.from("project_applications").select("*").eq("project_id", id).eq("volunteer_id", profile.id).maybeSingle();
    application = data;
  }
  const unavailable = project.status !== "published" || (project.availablePlaces ?? 0) <= 0 || new Date(project.end_date) < new Date();
  return <section className="py-10 sm:py-14"><div className="page-shell"><Link href={profile ? "/dashboard" : "/projects"} className="text-sm font-bold text-primary hover:underline">← Назад к проектам</Link><div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_23rem]"><div><ProjectCover src={project.cover_url} title={project.title} priority className="aspect-[16/8] rounded-[1.75rem]" /><div className="mt-7 flex flex-wrap gap-2"><Badge variant="secondary">{project.category}</Badge><StatusBadge status={project.status} /><Badge variant="outline">{project.format === "online" ? "Онлайн" : "Офлайн"}</Badge></div><h1 className="mt-5 text-balance text-4xl font-black tracking-tight sm:text-5xl">{project.title}</h1><p className="mt-6 whitespace-pre-line text-lg leading-8 text-muted-foreground">{project.description}</p><div className="mt-10 grid gap-4 sm:grid-cols-2"><Info icon={CalendarDays} label="Начало" value={formatDate(project.start_date, "d MMMM yyyy, HH:mm")} /><Info icon={CalendarDays} label="Окончание" value={formatDate(project.end_date, "d MMMM yyyy, HH:mm")} /><Info icon={project.format === "online" ? Laptop : MapPin} label={project.format === "online" ? "Формат" : "Место"} value={project.format === "online" ? "Онлайн" : `${project.city}, ${project.address}`} />{project.benefits.includes("volunteer_hours") ? <Info icon={Clock3} label="Волонтёрские часы" value={`${project.volunteer_hours} часов`} /> : null}</div><div className="mt-10 rounded-2xl border bg-surface p-6"><h2 className="text-xl font-black">Что предоставляет проект</h2><ProjectBenefits benefits={project.benefits} hours={project.volunteer_hours} className="mt-4" /></div>{project.requirements ? <div className="mt-10 rounded-2xl border bg-surface p-6"><h2 className="text-xl font-black">Требования к участникам</h2><div className="mt-4 flex items-start gap-3 text-sm leading-7 text-muted-foreground"><CheckCircle2 className="mt-1 size-5 shrink-0 text-success" /><p className="whitespace-pre-line">{project.requirements}</p></div></div> : null}</div><aside className="space-y-5 lg:sticky lg:top-24 lg:self-start"><Card><CardContent className="p-6"><div className="grid grid-cols-2 gap-4"><Metric icon={Users} value={project.participantCount ?? 0} label="участников" /><Metric icon={ShieldCheck} value={project.availablePlaces ?? project.required_volunteers} label="свободных мест" /></div><div className="my-6 border-t" /><ApplicationButton projectId={project.id} userRole={profile?.role} application={application} disabled={unavailable} /><p className="mt-4 text-center text-xs leading-5 text-muted-foreground">Координатор рассмотрит заявку и обновит её статус в вашем кабинете.</p></CardContent></Card><Card><CardContent className="p-6"><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Координатор</p><div className="mt-4 flex items-center gap-3"><Avatar className="size-12"><AvatarImage src={project.coordinator?.avatar_url ?? undefined} /><AvatarFallback>{initials(project.coordinator?.full_name)}</AvatarFallback></Avatar><div><p className="font-black">{project.coordinator?.full_name ?? "Координатор Qamqor"}</p><p className="mt-1 text-xs text-muted-foreground">{project.coordinator?.city ?? project.city}</p></div></div></CardContent></Card>{project.format === "offline" ? <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${project.city} ${project.address ?? ""}`)}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-sm font-bold text-primary hover:underline">Открыть на карте <ExternalLink className="size-4" /></a> : null}</aside></div></div></section>;
}

function Info({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) { return <div className="flex items-start gap-3 rounded-2xl bg-surface p-5"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></div><div><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 text-sm font-bold">{value}</p></div></div>; }
function Metric({ icon: Icon, value, label }: { icon: typeof Users; value: number; label: string }) { return <div><Icon className="size-5 text-primary" /><p className="mt-3 text-2xl font-black">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>; }
