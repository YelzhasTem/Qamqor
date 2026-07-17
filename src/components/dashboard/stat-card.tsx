import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({ label, value, hint, icon: Icon, tone = "green" }: { label: string; value: string | number; hint?: string; icon: LucideIcon; tone?: "green" | "amber" | "blue" | "purple" }) {
  const tones = { green: "bg-green-100 text-green-700", amber: "bg-amber-100 text-amber-700", blue: "bg-blue-100 text-blue-700", purple: "bg-purple-100 text-purple-700" };
  return <Card><CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-black tracking-tight">{value}</p>{hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}</div><div className={`flex size-11 items-center justify-center rounded-2xl ${tones[tone]}`}><Icon className="size-5" /></div></div></CardContent></Card>;
}
