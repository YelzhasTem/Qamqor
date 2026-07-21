"use client";
import { useLanguage } from "@/components/marketing/language-provider";
import { Button } from "@/components/ui/button";
export default function ProjectsError({ reset }: { reset: () => void }) { const { copy } = useLanguage(); return <div className="page-shell py-24 text-center"><h1 className="text-2xl font-black">{copy.errors.projectsTitle}</h1><p className="mt-3 text-muted-foreground">{copy.errors.projectsDescription}</p><Button onClick={reset} className="mt-6">{copy.errors.retry}</Button></div>; }
