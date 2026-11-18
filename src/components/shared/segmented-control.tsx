"use client";

import { cn } from "@/lib/utils";

type Option<T extends string> = { value: T; label: string };

/** Mutually exclusive options in one rounded track (radio group semantics). */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("inline-flex min-h-[52px] items-center gap-1 rounded-row bg-inset p-1", className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-11 flex-1 items-center justify-center rounded-control px-4 text-sm font-semibold transition-colors",
              active ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
