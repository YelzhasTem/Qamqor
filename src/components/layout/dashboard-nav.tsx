"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, FolderKanban, Gauge, LayoutList, UserRound, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";

const volunteerLinks = [
  { href: "/dashboard", label: "Обзор", icon: Gauge },
  { href: "/projects", label: "Найти проекты", icon: LayoutList },
  { href: "/my-projects", label: "Мои проекты", icon: FolderKanban },
  { href: "/profile", label: "Профиль и награды", icon: Award },
];
const coordinatorLinks = [
  { href: "/dashboard", label: "Обзор", icon: Gauge },
  { href: "/coordinator/projects", label: "Мои проекты", icon: FolderKanban },
  { href: "/coordinator/projects/new", label: "Создать проект", icon: UsersRound },
  { href: "/profile", label: "Профиль", icon: UserRound },
];

export function DashboardNav({ role, onNavigate }: { role: "volunteer" | "coordinator"; onNavigate?: () => void }) {
  const pathname = usePathname();
  const links = role === "coordinator" ? coordinatorLinks : volunteerLinks;
  return <nav className="grid gap-1.5">{links.map(({ href, label, icon: Icon }) => {
    const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
    return <Link key={href} href={href} onClick={onNavigate} className={cn("flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition", active ? "bg-primary text-primary-foreground shadow-md shadow-primary/15" : "text-muted-foreground hover:bg-primary/5 hover:text-foreground")}><Icon className="size-4.5" />{label}</Link>;
  })}</nav>;
}
