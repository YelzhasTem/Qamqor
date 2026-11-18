"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/components/i18n/language-provider";
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
  const { t } = useLanguage();
  const [pending, setPending] = useState(false);

  if (!userRole) {
    return <Button asChild size="lg" className="w-full"><Link href={`/auth/login?next=/projects/${projectId}`}>{t.marketing.application.login}</Link></Button>;
  }

  if (userRole !== "volunteer") {
    return <Button disabled size="lg" className="w-full" variant="secondary">{t.marketing.application.volunteersOnly}</Button>;
  }

  if (application) {
    const hasGroupAccess = ["pending", "approved", "attended", "completed"].includes(application.status);
    return (
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3 rounded-xl border bg-surface px-4 py-3 text-sm font-semibold">
          <span>{t.marketing.application.status}</span><StatusBadge status={application.status} />
        </div>
        {hasGroupAccess && whatsappGroupUrl ? (
          <div className="grid gap-2 rounded-xl border border-success/30 bg-success/10 p-3">
            <p className="text-xs font-semibold leading-5 text-success-foreground">{t.marketing.application.joinNote}</p>
            <Button asChild className="w-full bg-success text-white hover:bg-success/90">
              <a href={whatsappGroupUrl} target="_blank" rel="noreferrer"><MessageCircle />{t.marketing.application.joinWhatsapp}<ExternalLink className="size-4" /></a>
            </Button>
          </div>
        ) : null}
        {["pending", "approved"].includes(application.status) ? (
          <Button variant="outline" disabled={pending} onClick={async () => {
            setPending(true);
            const result = await cancelApplicationAction(application.id, projectId);
            setPending(false);
            if (result.success) toast.success(t.marketing.application.cancelled);
            else toast.error(result.error);
            router.refresh();
          }}>
            {pending ? <Loader2 className="animate-spin" /> : null}{t.marketing.application.cancel}
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
      if (result.success) toast.success(t.marketing.application.sent);
      else toast.error(result.error);
      router.refresh();
    }}>
      {pending ? <Loader2 className="animate-spin" /> : null}{disabled ? t.marketing.application.noPlaces : t.marketing.application.apply}
    </Button>
  );
}
