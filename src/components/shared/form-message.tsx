import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function FormMessage({ message, type = "error" }: { message?: string; type?: "error" | "success" }) {
  if (!message) return null;
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;
  return <div className={cn("flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm text-foreground", type === "success" ? "border-success/30 bg-success/10" : "border-danger/30 bg-danger/10")}><Icon className={cn("mt-0.5 size-4 shrink-0", type === "success" ? "text-success" : "text-danger")} /><span>{message}</span></div>;
}
