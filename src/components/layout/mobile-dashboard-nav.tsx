"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/layout/logo";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import type { UserRole } from "@/types/roles";

export function MobileDashboardNav({ role }: { role: UserRole }) {
  const [open, setOpen] = useState(false);
  return <Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><Button variant="outline" size="icon" className="md:hidden"><Menu /><span className="sr-only">Открыть меню</span></Button></SheetTrigger><SheetContent><Logo /><div className="mt-10"><DashboardNav role={role} onNavigate={() => setOpen(false)} /></div></SheetContent></Sheet>;
}
