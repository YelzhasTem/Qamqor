import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5 font-black tracking-tight text-green-950", className)} aria-label="Qamqor — на главную">
      <span className="flex size-10 items-center justify-center rounded-xl bg-green-600 text-white shadow-md shadow-green-600/20"><HeartHandshake className="size-5" /></span>
      {!compact ? <span className="text-xl">Qamqor</span> : null}
    </Link>
  );
}
