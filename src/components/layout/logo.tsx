import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5 font-black tracking-tight text-foreground", className)} aria-label="Qamqor — на главную">
      <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20"><HeartHandshake className="size-5" /></span>
      {!compact ? <span className="text-xl">Qamqor</span> : null}
    </Link>
  );
}
