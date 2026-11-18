import { cn } from "@/lib/utils";

/** Neutral diagonal-stripe block shown when a project has no cover image. */
export function PhotoPlaceholder({ className, label }: { className?: string; label?: string }) {
  return (
    <div
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("photo-placeholder size-full", className)}
    />
  );
}
