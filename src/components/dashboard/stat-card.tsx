import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({ label, value, hint, icon: Icon, tone = "primary" }: { label: string; value: string | number; hint?: string; icon: LucideIcon; tone?: "primary" | "success" | "accent" | "info" }) {
  const tones = { primary: "bg-primary/10 text-primary", success: "bg-success/15 text-success-foreground", accent: "bg-accent/15 text-accent-foreground", info: "bg-info/10 text-info" };
  return <Card><CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-black tracking-tight">{value}</p>{hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}</div><div className={`flex size-11 items-center justify-center rounded-2xl ${tones[tone]}`}><Icon className="size-5" /></div></div></CardContent></Card>;
}
