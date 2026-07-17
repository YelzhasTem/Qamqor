import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", {
  variants: {
    variant: {
      default: "bg-primary text-white",
      secondary: "bg-secondary text-secondary-foreground",
      outline: "border bg-white text-foreground",
      muted: "bg-muted text-muted-foreground",
      warning: "bg-amber-100 text-amber-800",
      danger: "bg-red-100 text-red-700",
      success: "bg-green-100 text-green-700",
    },
  },
  defaultVariants: { variant: "default" },
});

function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
