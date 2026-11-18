import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold leading-4 [&_svg]:size-3.5 [&_svg]:shrink-0", {
  variants: {
    variant: {
      default: "bg-ink text-white",
      secondary: "bg-inset text-ink-muted",
      outline: "border border-control bg-surface text-ink",
      muted: "bg-inset text-ink-muted",
      info: "bg-informative text-informative-foreground",
      warning: "bg-waiting text-waiting-foreground",
      danger: "bg-negative text-negative-foreground",
      success: "bg-positive text-positive-foreground",
    },
  },
  defaultVariants: { variant: "default" },
});

function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
