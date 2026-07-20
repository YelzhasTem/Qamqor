"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, FolderKanban, Gauge, PlusCircle, ShieldCheck, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { isCoordinatorRole, type UserRole } from "@/types/roles";

const volunteerLinks = [
  { href: "/dashboard", label: "Дашборд", icon: Gauge },
  { href: "/cabinet", label: "Кабинет", icon: UserRound },
  { href: "/my-projects", label: "Мои проекты", icon: FolderKanban },
  { href: "/profile", label: "Профиль и награды", icon: Award },
];
const coordinatorLinks = [
  { href: "/dashboard", label: "Дашборд", icon: Gauge },
  { href: "/cabinet", label: "Кабинет", icon: UserRound },
  { href: "/coordinator/projects", label: "Мои проекты", icon: FolderKanban },
  { href: "/coordinator/projects/new", label: "Создать проект", icon: PlusCircle },
  { href: "/profile", label: "Профиль", icon: UserRound },
];
const adminLinks = [
  ...coordinatorLinks,
  { href: "/admin/users", label: "Пользователи", icon: ShieldCheck },
];

export function DashboardNav({ role, onNavigate }: { role: UserRole; onNavigate?: () => void }) {
  const pathname = usePathname();
  const links = role === "admin" ? adminLinks : isCoordinatorRole(role) ? coordinatorLinks : volunteerLinks;
  return <nav className="grid gap-1.5">{links.map(({ href, label, icon: Icon }) => {
    const active = href === "/dashboard" || href === "/cabinet" || href === "/coordinator/projects/new"
      ? pathname === href
      : href === "/coordinator/projects"
        ? pathname.startsWith(href) && !pathname.startsWith("/coordinator/projects/new")
        : pathname.startsWith(href);
    return <Link key={href} href={href} onClick={onNavigate} className={cn("flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition", active ? "bg-primary text-primary-foreground shadow-md shadow-primary/15" : "text-muted-foreground hover:bg-primary/5 hover:text-foreground")}><Icon className="size-4.5" />{label}</Link>;
  })}</nav>;
}
