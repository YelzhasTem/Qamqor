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

const SheetContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(
  ({ className, children, ...props }, ref) => {
    const { t } = useLanguage();
    return (
      <SheetPortal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40" />
        <DialogPrimitive.Content
          ref={ref}
          aria-describedby={undefined}
          className={cn("fixed inset-y-0 left-0 z-50 w-[86%] max-w-sm overflow-y-auto rounded-r-card bg-surface p-5 pt-[calc(1.25rem+var(--safe-top))] pb-[calc(1.25rem+var(--safe-bottom))] shadow-xl outline-none", className)}
          {...props}
        >
          <SheetTitle className="sr-only">{t.common.menu}</SheetTitle>
          {children}
          <DialogPrimitive.Close className="absolute right-3 top-[calc(0.75rem+var(--safe-top))] inline-flex size-11 items-center justify-center rounded-full text-ink-secondary hover:bg-inset hover:text-ink">
            <X className="size-5" />
            <span className="sr-only">{t.common.close}</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </SheetPortal>
    );
  },
);
SheetContent.displayName = DialogPrimitive.Content.displayName;

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetTitle };
