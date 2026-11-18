import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-12 w-full rounded-control border border-control bg-surface px-3.5 text-base text-ink outline-none transition-colors placeholder:text-ink-secondary/80 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand aria-[invalid=true]:border-negative-foreground disabled:cursor-not-allowed disabled:bg-page disabled:opacity-60 md:text-[15px]",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
