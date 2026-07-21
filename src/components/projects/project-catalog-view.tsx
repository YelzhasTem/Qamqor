"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import { useLanguage } from "@/components/marketing/language-provider";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectFilters } from "@/components/projects/project-filters";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import type { ProjectFilters as ProjectQueryFilters } from "@/lib/queries/projects";
import type { ProjectWithMeta } from "@/types/app";

type CatalogResult = {
  projects: ProjectWithMeta[];
  count: number;
  page: number;
  pageSize: number;
  cities: string[];
  categories: string[];
};

export function ProjectCatalogView({ filters, result }: { filters: ProjectQueryFilters; result: CatalogResult }) {
  const { copy } = useLanguage();
  const pages = Math.ceil(result.count / result.pageSize);
  const hrefFor = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && key !== "page") params.set(key, String(value));
    });
    params.set("page", String(page));
    return `/projects?${params}`;
  };

  return (
    <section className="py-14 sm:py-18">
      <div className="page-shell">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[.18em] text-primary">{copy.catalog.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{copy.catalog.title}</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">{copy.catalog.description}</p>
        </div>
        <div className="mt-9"><ProjectFilters filters={filters} cities={result.cities} categories={result.categories} /></div>
        <div className="mt-7 flex items-center justify-between"><p className="text-sm text-muted-foreground">{copy.catalog.found}: <span className="font-bold text-foreground">{result.count}</span></p></div>
        {result.projects.length ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{result.projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div>
        ) : (
          <div className="mt-8"><EmptyState icon={SearchX} title={copy.catalog.emptyTitle} description={copy.catalog.emptyDescription} action={{ label: copy.catalog.reset, href: "/projects" }} /></div>
        )}
        {pages > 1 ? (
          <div className="mt-10 flex items-center justify-center gap-3">
            <Button asChild variant="outline" size="icon" aria-disabled={result.page <= 1}><Link href={hrefFor(Math.max(1, result.page - 1))} aria-label={copy.catalog.previousPage}><ChevronLeft /></Link></Button>
            <span className="text-sm font-bold">{result.page} / {pages}</span>
            <Button asChild variant="outline" size="icon" aria-disabled={result.page >= pages}><Link href={hrefFor(Math.min(pages, result.page + 1))} aria-label={copy.catalog.nextPage}><ChevronRight /></Link></Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
