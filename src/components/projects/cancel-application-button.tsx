"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cancelApplicationAction } from "@/lib/actions/applications";

export function CancelApplicationButton({ applicationId, projectId }: { applicationId: string; projectId: string }) {
  const [pending, setPending] = useState(false);
  const router = useRouter();
  return <Button variant="ghost" size="sm" disabled={pending} onClick={async () => { if (!window.confirm("Отменить заявку на проект?")) return; setPending(true); const result = await cancelApplicationAction(applicationId, projectId); setPending(false); if (result.success) { toast.success("Заявка отменена"); router.refresh(); } else toast.error(result.error); }}>{pending ? <Loader2 className="animate-spin" /> : <X />}Отменить</Button>;
}
