import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProjectFilters({ filters, cities, categories }: { filters: { q?: string; city?: string; category?: string; format?: string; sort?: string }; cities: string[]; categories: string[] }) {
  const selectClass = "h-11 rounded-xl border border-input bg-white px-3 text-sm font-medium outline-none focus:border-green-400 focus:ring-3 focus:ring-green-100";
  return <form action="/projects" className="grid gap-3 rounded-2xl border bg-white p-4 shadow-sm lg:grid-cols-[1.5fr_repeat(4,minmax(0,1fr))_auto]">
    <div className="relative"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input name="q" defaultValue={filters.q} placeholder="Поиск проектов" className="pl-10" /></div>
    <select name="city" defaultValue={filters.city ?? ""} className={selectClass} aria-label="Город"><option value="">Все города</option>{cities.map((city) => <option key={city}>{city}</option>)}</select>
    <select name="category" defaultValue={filters.category ?? ""} className={selectClass} aria-label="Категория"><option value="">Все категории</option>{categories.map((category) => <option key={category}>{category}</option>)}</select>
    <select name="format" defaultValue={filters.format ?? ""} className={selectClass} aria-label="Формат"><option value="">Любой формат</option><option value="offline">Офлайн</option><option value="online">Онлайн</option></select>
    <select name="sort" defaultValue={filters.sort ?? "soon"} className={selectClass} aria-label="Сортировка"><option value="soon">Скоро</option><option value="newest">Сначала новые</option><option value="hours">Больше часов</option></select>
    <Button type="submit" className="h-11"><SlidersHorizontal />Применить</Button>
  </form>;
}
