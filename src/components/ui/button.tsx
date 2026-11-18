import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-button text-[15px] font-semibold transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[18px] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /** Ink background: the default primary action. */
        default: "bg-ink text-white hover:bg-ink/85",
        /** Brand accent: only for the single most important action on a screen. */
        brand: "bg-brand text-brand-foreground hover:bg-brand-hover",
        /** White with a control border. */
        secondary: "border border-control bg-surface text-ink hover:bg-page",
        /** Alias of secondary kept for existing screens. */
        outline: "border border-control bg-surface text-ink hover:bg-page",
        ghost: "text-ink hover:bg-inset",
        destructive: "border border-negative-foreground/30 bg-negative text-negative-foreground hover:bg-negative/70",
        link: "h-auto px-0 text-ink underline underline-offset-4 decoration-control hover:decoration-ink",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-11 px-3.5 text-sm",
        lg: "h-13 px-6 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
