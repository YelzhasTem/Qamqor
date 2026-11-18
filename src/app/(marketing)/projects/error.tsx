"use client";
import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";
export default function ProjectsError({ reset }: { reset: () => void }) { const { t } = useLanguage(); return <div className="page-shell py-24 text-center"><h1 className="text-2xl font-black">{t.marketing.errors.projectsTitle}</h1><p className="mt-3 text-muted-foreground">{t.marketing.errors.projectsDescription}</p><Button onClick={reset} className="mt-6">{t.marketing.errors.retry}</Button></div>; }
