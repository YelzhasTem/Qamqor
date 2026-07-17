import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function FormMessage({ message, type = "error" }: { message?: string; type?: "error" | "success" }) {
  if (!message) return null;
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;
  return <div className={cn("flex items-start gap-2 rounded-xl px-3.5 py-3 text-sm", type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}><Icon className="mt-0.5 size-4 shrink-0" /><span>{message}</span></div>;
}
