"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useLanguage } from "@/components/marketing/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { translateValue } from "@/lib/i18n/marketing-copy";

export function ProjectFilters({ filters, cities, categories }: { filters: { q?: string; city?: string; category?: string; format?: string; sort?: string }; cities: string[]; categories: string[] }) {
  const { copy } = useLanguage();
  const selectClass = "h-11 rounded-xl border border-input bg-surface px-3 text-sm font-medium outline-none focus:border-primary focus:ring-3 focus:ring-primary/15";
  return <form action="/projects" className="grid gap-3 rounded-2xl border bg-surface p-4 shadow-sm lg:grid-cols-[1.5fr_repeat(4,minmax(0,1fr))_auto]">
    <div className="relative"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input name="q" defaultValue={filters.q} placeholder={copy.catalog.search} className="pl-10" /></div>
    <select name="city" defaultValue={filters.city ?? ""} className={selectClass} aria-label={copy.catalog.city}><option value="">{copy.catalog.allCities}</option>{cities.map((city) => <option key={city} value={city}>{translateValue(city, copy.cities)}</option>)}</select>
    <select name="category" defaultValue={filters.category ?? ""} className={selectClass} aria-label={copy.catalog.category}><option value="">{copy.catalog.allCategories}</option>{categories.map((category) => <option key={category} value={category}>{translateValue(category, copy.categories)}</option>)}</select>
    <select name="format" defaultValue={filters.format ?? ""} className={selectClass} aria-label={copy.catalog.format}><option value="">{copy.catalog.anyFormat}</option><option value="offline">{copy.common.offline}</option><option value="online">{copy.common.online}</option></select>
    <select name="sort" defaultValue={filters.sort ?? "soon"} className={selectClass} aria-label={copy.catalog.sort}><option value="soon">{copy.catalog.soon}</option><option value="newest">{copy.catalog.newest}</option><option value="hours">{copy.catalog.mostHours}</option></select>
    <Button type="submit" className="h-11"><SlidersHorizontal />{copy.catalog.apply}</Button>
  </form>;
}
