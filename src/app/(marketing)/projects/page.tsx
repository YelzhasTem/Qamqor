import type { Metadata } from "next";
import { ProjectCatalogView } from "@/components/projects/project-catalog-view";
import { getProjectCatalog } from "@/lib/queries/projects";

export const metadata: Metadata = { title: "Каталог проектов", description: "Найдите волонтёрский проект по городу, категории и формату." };

type Params = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const raw = await searchParams;
  const filters = { q: one(raw.q), city: one(raw.city), category: one(raw.category), format: one(raw.format), sort: one(raw.sort), page: Number(one(raw.page) || 1) };
  const result = await getProjectCatalog(filters);
  return <ProjectCatalogView filters={filters} result={result} />;
}
