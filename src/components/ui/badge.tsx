import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      outline: "border bg-surface text-foreground",
      muted: "bg-muted text-muted-foreground",
      info: "bg-info text-info-foreground",
      warning: "border border-warning/30 bg-warning/15 text-warning-foreground",
      danger: "border border-danger/30 bg-danger/10 text-danger-foreground",
      success: "border border-success/30 bg-success/15 text-success-foreground",
    },
  },
  defaultVariants: { variant: "default" },
});

function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
