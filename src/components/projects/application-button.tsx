"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { applyToProjectAction, cancelApplicationAction } from "@/lib/actions/applications";
import type { ProjectApplication } from "@/types/app";
import type { UserRole } from "@/types/roles";

export function ApplicationButton({ projectId, userRole, application, disabled }: { projectId: string; userRole?: UserRole; application?: ProjectApplication | null; disabled?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  if (!userRole) return <Button asChild size="lg" className="w-full"><Link href={`/auth/login?next=/projects/${projectId}`}>Войти и подать заявку</Link></Button>;
  if (userRole !== "volunteer") return <Button disabled size="lg" className="w-full" variant="secondary">Заявки доступны волонтёрам</Button>;
  if (application) return <div className="grid gap-3"><div className="flex items-center justify-between gap-3 rounded-xl border bg-surface px-4 py-3 text-sm font-semibold"><span>Статус заявки</span><StatusBadge status={application.status} /></div>{["pending", "approved"].includes(application.status) ? <Button variant="outline" disabled={pending} onClick={async () => { setPending(true); const result = await cancelApplicationAction(application.id, projectId); setPending(false); if (result.success) toast.success("Заявка отменена"); else toast.error(result.error); router.refresh(); }}>{pending ? <Loader2 className="animate-spin" /> : null}Отменить заявку</Button> : null}</div>;
  return <Button size="lg" className="w-full" disabled={pending || disabled} onClick={async () => { setPending(true); const result = await applyToProjectAction(projectId); setPending(false); if (result.success) toast.success("Заявка отправлена"); else toast.error(result.error); router.refresh(); }}>{pending ? <Loader2 className="animate-spin" /> : null}{disabled ? "Нет свободных мест" : "Подать заявку"}</Button>;
}
