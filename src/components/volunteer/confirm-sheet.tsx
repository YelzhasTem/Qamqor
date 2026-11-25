"use client";

import { Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

/** Bottom sheet asking to confirm an action that cannot be undone from here. */
export function ConfirmSheet({
  open,
  onOpenChange,
  title,
  text,
  extra,
  confirmLabel,
  cancelLabel,
  onConfirm,
  pending = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  text: string;
  extra?: string | null;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  pending?: boolean;
}) {
  return (
    <Sheet open={open} onOpenChange={(next) => { if (!pending) onOpenChange(next); }}>
      <SheetContent side="bottom" title={title} showTitle aria-describedby="confirm-sheet-text">
        <SheetDescription id="confirm-sheet-text" className="mt-2 text-[15px] leading-6 text-ink-secondary">
          {text}
          {extra ? <><br /><span className="font-semibold text-ink">{extra}</span></> : null}
        </SheetDescription>
        <div className="mt-6 grid gap-2.5">
          <Button variant="destructive" size="lg" onClick={onConfirm} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : null}
            {confirmLabel}
          </Button>
          <Button variant="secondary" size="lg" onClick={() => onOpenChange(false)} disabled={pending}>{cancelLabel}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
