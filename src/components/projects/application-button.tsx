"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { applyToProjectAction, cancelApplicationAction } from "@/lib/actions/applications";
import type { ProjectApplication } from "@/types/app";

export function ApplicationButton({ projectId, userRole, application, disabled }: { projectId: string; userRole?: "volunteer" | "coordinator"; application?: ProjectApplication | null; disabled?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  if (!userRole) return <Button asChild size="lg" className="w-full"><Link href={`/auth/login?next=/projects/${projectId}`}>Войти и подать заявку</Link></Button>;
  if (userRole === "coordinator") return <Button disabled size="lg" className="w-full" variant="secondary">Заявки доступны волонтёрам</Button>;
  if (application) return <div className="grid gap-3"><div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">Статус заявки: {application.status === "pending" ? "на рассмотрении" : application.status === "approved" ? "одобрено" : application.status === "rejected" ? "отклонено" : application.status === "attended" ? "участие отмечено" : "завершено"}</div>{["pending", "approved"].includes(application.status) ? <Button variant="outline" disabled={pending} onClick={async () => { setPending(true); const result = await cancelApplicationAction(application.id, projectId); setPending(false); if (result.success) toast.success("Заявка отменена"); else toast.error(result.error); router.refresh(); }}>{pending ? <Loader2 className="animate-spin" /> : null}Отменить заявку</Button> : null}</div>;
  return <Button size="lg" className="w-full" disabled={pending || disabled} onClick={async () => { setPending(true); const result = await applyToProjectAction(projectId); setPending(false); if (result.success) toast.success("Заявка отправлена"); else toast.error(result.error); router.refresh(); }}>{pending ? <Loader2 className="animate-spin" /> : null}{disabled ? "Нет свободных мест" : "Подать заявку"}</Button>;
}
