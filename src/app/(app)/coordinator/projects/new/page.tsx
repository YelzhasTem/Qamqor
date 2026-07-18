import type { Metadata } from "next";
import { ProjectForm } from "@/components/forms/project-form";
import { requireRole } from "@/lib/auth";
export const metadata: Metadata = { title: "Новый проект" };
export default async function NewProjectPage() { await requireRole("coordinator"); return <div className="mx-auto max-w-4xl"><p className="text-sm font-bold text-primary">Новая инициатива</p><h1 className="mt-1 text-3xl font-black tracking-tight">Создание проекта</h1><p className="mt-2 text-sm text-muted-foreground">Расскажите волонтёрам, чем они смогут помочь.</p><div className="mt-7"><ProjectForm /></div></div>; }
