"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { translateValue } from "@/lib/i18n/format";

export function ProjectFilters({ filters, cities, categories }: { filters: { q?: string; city?: string; category?: string; format?: string; sort?: string }; cities: string[]; categories: string[] }) {
  const { t } = useLanguage();
  const selectClass = "h-11 rounded-xl border border-input bg-surface px-3 text-sm font-medium outline-none focus:border-primary focus:ring-3 focus:ring-primary/15";
  return <form action="/projects" className="grid gap-3 rounded-2xl border bg-surface p-4 shadow-sm lg:grid-cols-[1.5fr_repeat(4,minmax(0,1fr))_auto]">
    <div className="relative"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input name="q" defaultValue={filters.q} placeholder={t.marketing.catalog.search} className="pl-10" /></div>
    <select name="city" defaultValue={filters.city ?? ""} className={selectClass} aria-label={t.marketing.catalog.city}><option value="">{t.marketing.catalog.allCities}</option>{cities.map((city) => <option key={city} value={city}>{translateValue(city, t.common.cities)}</option>)}</select>
    <select name="category" defaultValue={filters.category ?? ""} className={selectClass} aria-label={t.marketing.catalog.category}><option value="">{t.marketing.catalog.allCategories}</option>{categories.map((category) => <option key={category} value={category}>{translateValue(category, t.common.categories)}</option>)}</select>
    <select name="format" defaultValue={filters.format ?? ""} className={selectClass} aria-label={t.marketing.catalog.format}><option value="">{t.marketing.catalog.anyFormat}</option><option value="offline">{t.common.offline}</option><option value="online">{t.common.online}</option></select>
    <select name="sort" defaultValue={filters.sort ?? "soon"} className={selectClass} aria-label={t.marketing.catalog.sort}><option value="soon">{t.marketing.catalog.soon}</option><option value="newest">{t.marketing.catalog.newest}</option><option value="hours">{t.marketing.catalog.mostHours}</option></select>
    <Button type="submit" className="h-11"><SlidersHorizontal />{t.marketing.catalog.apply}</Button>
  </form>;
}
