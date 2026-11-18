"use client";

import Link from "next/link";
import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";
export default function ProjectNotFound() { const { t } = useLanguage(); return <div className="page-shell py-24 text-center"><p className="text-sm font-black uppercase tracking-widest text-primary">404</p><h1 className="mt-3 text-4xl font-black">{t.marketing.errors.notFoundTitle}</h1><p className="mt-4 text-muted-foreground">{t.marketing.errors.notFoundDescription}</p><Button asChild className="mt-7"><Link href="/projects">{t.marketing.errors.toCatalog}</Link></Button></div>; }
