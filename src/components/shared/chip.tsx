import * as React from "react";
import { cn } from "@/lib/utils";

/** Filter pill with a pressed state. 44px tall so it is easy to tap. */
export function Chip({ pressed = false, className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { pressed?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        "inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors",
        pressed ? "border-ink bg-ink text-white" : "border-control bg-surface text-ink hover:bg-page",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** Non-interactive chip for labels inside cards and links (category, benefits). */
export function ChipLabel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex min-h-7 shrink-0 items-center gap-1.5 rounded-full border border-control bg-surface px-3 text-[13px] font-semibold leading-4 text-ink", className)}>
      {children}
    </span>
  );
}
