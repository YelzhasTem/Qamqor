"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";
import { ConfirmSheet } from "@/components/volunteer/confirm-sheet";
import { cancelApplicationAction } from "@/lib/actions/applications";
import { errorText } from "@/lib/errors";

/** Secondary cancel button with the shared confirmation sheet. */
export function CancelApplicationButton({ applicationId, projectId, label }: { applicationId: string; projectId: string; label: string }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function confirm() {
    setPending(true);
    const result = await cancelApplicationAction(applicationId, projectId);
    setPending(false);
    setOpen(false);
    if (result.success) {
      toast.success(t.volunteer.bar.cancelled);
      router.refresh();
    } else {
      toast.error(errorText(result.error, t));
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>{label}</Button>
      <ConfirmSheet
        open={open}
        onOpenChange={setOpen}
        title={t.volunteer.confirmCancel.title}
        text={t.volunteer.confirmCancel.text}
        confirmLabel={t.volunteer.confirmCancel.confirm}
        cancelLabel={t.volunteer.confirmCancel.keep}
        onConfirm={() => void confirm()}
        pending={pending}
      />
    </>
  );
}
