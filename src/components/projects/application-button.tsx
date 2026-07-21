"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/components/marketing/language-provider";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { applyToProjectAction, cancelApplicationAction } from "@/lib/actions/applications";
import type { ProjectApplication } from "@/types/app";
import type { UserRole } from "@/types/roles";

export function ApplicationButton({
  projectId,
  userRole,
  application,
  whatsappGroupUrl,
  disabled,
}: {
  projectId: string;
  userRole?: UserRole;
  application?: ProjectApplication | null;
  whatsappGroupUrl?: string | null;
  disabled?: boolean;
}) {
  const router = useRouter();
  const { copy } = useLanguage();
  const [pending, setPending] = useState(false);

  if (!userRole) {
    return <Button asChild size="lg" className="w-full"><Link href={`/auth/login?next=/projects/${projectId}`}>{copy.application.login}</Link></Button>;
  }

  if (userRole !== "volunteer") {
    return <Button disabled size="lg" className="w-full" variant="secondary">{copy.application.volunteersOnly}</Button>;
  }

  if (application) {
    const hasGroupAccess = ["pending", "approved", "attended", "completed"].includes(application.status);
    return (
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3 rounded-xl border bg-surface px-4 py-3 text-sm font-semibold">
          <span>{copy.application.status}</span><StatusBadge status={application.status} />
        </div>
        {hasGroupAccess && whatsappGroupUrl ? (
          <div className="grid gap-2 rounded-xl border border-success/30 bg-success/10 p-3">
            <p className="text-xs font-semibold leading-5 text-success-foreground">{copy.application.joinNote}</p>
            <Button asChild className="w-full bg-success text-white hover:bg-success/90">
              <a href={whatsappGroupUrl} target="_blank" rel="noreferrer"><MessageCircle />{copy.application.joinWhatsapp}<ExternalLink className="size-4" /></a>
            </Button>
          </div>
        ) : null}
        {["pending", "approved"].includes(application.status) ? (
          <Button variant="outline" disabled={pending} onClick={async () => {
            setPending(true);
            const result = await cancelApplicationAction(application.id, projectId);
            setPending(false);
            if (result.success) toast.success(copy.application.cancelled);
            else toast.error(result.error);
            router.refresh();
          }}>
            {pending ? <Loader2 className="animate-spin" /> : null}{copy.application.cancel}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <Button size="lg" className="w-full" disabled={pending || disabled} onClick={async () => {
      setPending(true);
      const result = await applyToProjectAction(projectId);
      setPending(false);
      if (result.success) toast.success(copy.application.sent);
      else toast.error(result.error);
      router.refresh();
    }}>
      {pending ? <Loader2 className="animate-spin" /> : null}{disabled ? copy.application.noPlaces : copy.application.apply}
    </Button>
  );
}
