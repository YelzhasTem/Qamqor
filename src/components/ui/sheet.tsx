"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useLanguage } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;
const SheetTitle = DialogPrimitive.Title;

type SheetContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  /** "left" is the navigation drawer; "bottom" is a phone-style sheet for confirmations. */
  side?: "left" | "bottom";
  /** Accessible title. Defaults to the menu label used by the navigation drawer. */
  title?: string;
  /** Show the title as a visible heading (bottom sheets) instead of screen-reader only. */
  showTitle?: boolean;
};

const SheetContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, SheetContentProps>(
  ({ className, children, side = "left", title, showTitle = false, ...props }, ref) => {
    const { t } = useLanguage();
    return (
      <SheetPortal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40" />
        <DialogPrimitive.Content
          ref={ref}
          aria-describedby={undefined}
          className={cn(
            side === "left"
              ? "fixed inset-y-0 left-0 z-50 w-[86%] max-w-sm overflow-y-auto rounded-r-card bg-surface p-5 pt-[calc(1.25rem+var(--safe-top))] pb-[calc(1.25rem+var(--safe-bottom))] shadow-xl outline-none"
              : "fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[85dvh] w-full max-w-[560px] overflow-y-auto rounded-t-card bg-surface px-5 pt-6 pb-[calc(1.25rem+var(--safe-bottom))] shadow-xl outline-none md:bottom-6 md:rounded-card",
            className,
          )}
          {...props}
        >
          <SheetTitle className={showTitle ? "pr-12 text-xl font-extrabold leading-tight tracking-tight" : "sr-only"}>{title ?? t.common.menu}</SheetTitle>
          {children}
          <DialogPrimitive.Close className={cn("absolute right-3 inline-flex size-11 items-center justify-center rounded-full text-ink-secondary hover:bg-inset hover:text-ink", side === "left" ? "top-[calc(0.75rem+var(--safe-top))]" : "top-3")}>
            <X className="size-5" />
            <span className="sr-only">{t.common.close}</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </SheetPortal>
    );
  },
);
SheetContent.displayName = DialogPrimitive.Content.displayName;

const SheetDescription = DialogPrimitive.Description;

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetTitle, SheetDescription };
