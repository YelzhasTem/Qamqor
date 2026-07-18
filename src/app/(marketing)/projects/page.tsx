import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectFilters } from "@/components/projects/project-filters";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { getProjectCatalog } from "@/lib/queries/projects";

export const metadata: Metadata = { title: "Каталог проектов", description: "Найдите волонтёрский проект по городу, категории и формату." };

type Params = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const raw = await searchParams;
  const filters = { q: one(raw.q), city: one(raw.city), category: one(raw.category), format: one(raw.format), sort: one(raw.sort), page: Number(one(raw.page) || 1) };
  const result = await getProjectCatalog(filters);
  const pages = Math.ceil(result.count / result.pageSize);
  const hrefFor = (page: number) => { const params = new URLSearchParams(); Object.entries(filters).forEach(([key, value]) => { if (value && key !== "page") params.set(key, String(value)); }); params.set("page", String(page)); return `/projects?${params}`; };
  return <section className="py-14 sm:py-18"><div className="page-shell"><div className="max-w-3xl"><p className="text-sm font-black uppercase tracking-[.18em] text-primary">Каталог</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Найдите проект, который вам близок</h1><p className="mt-4 text-lg leading-8 text-muted-foreground">Помогайте там, где ваши время, опыт и внимание принесут наибольшую пользу.</p></div><div className="mt-9"><ProjectFilters filters={filters} cities={result.cities} categories={result.categories} /></div><div className="mt-7 flex items-center justify-between"><p className="text-sm text-muted-foreground">Найдено: <span className="font-bold text-foreground">{result.count}</span></p></div>{result.projects.length ? <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{result.projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div> : <div className="mt-8"><EmptyState icon={SearchX} title="Проекты не найдены" description="Попробуйте изменить запрос или сбросить фильтры." action={{ label: "Сбросить фильтры", href: "/projects" }} /></div>}{pages > 1 ? <div className="mt-10 flex items-center justify-center gap-3"><Button asChild variant="outline" size="icon" aria-disabled={result.page <= 1}><Link href={hrefFor(Math.max(1, result.page - 1))}><ChevronLeft /></Link></Button><span className="text-sm font-bold">{result.page} / {pages}</span><Button asChild variant="outline" size="icon" aria-disabled={result.page >= pages}><Link href={hrefFor(Math.min(pages, result.page + 1))}><ChevronRight /></Link></Button></div> : null}</div></section>;
}
