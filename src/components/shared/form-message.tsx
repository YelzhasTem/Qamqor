import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function FormMessage({ message, type = "error" }: { message?: string; type?: "error" | "success" }) {
  if (!message) return null;
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-2.5 rounded-row px-3.5 py-3 text-sm leading-5", type === "success" ? "bg-positive text-positive-foreground" : "bg-negative text-negative-foreground")}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
