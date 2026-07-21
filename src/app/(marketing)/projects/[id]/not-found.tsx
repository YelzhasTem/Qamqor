"use client";

import Link from "next/link";
import { useLanguage } from "@/components/marketing/language-provider";
import { Button } from "@/components/ui/button";
export default function ProjectNotFound() { const { copy } = useLanguage(); return <div className="page-shell py-24 text-center"><p className="text-sm font-black uppercase tracking-widest text-primary">404</p><h1 className="mt-3 text-4xl font-black">{copy.errors.notFoundTitle}</h1><p className="mt-4 text-muted-foreground">{copy.errors.notFoundDescription}</p><Button asChild className="mt-7"><Link href="/projects">{copy.errors.toCatalog}</Link></Button></div>; }
