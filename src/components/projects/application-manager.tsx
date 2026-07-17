"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Clock3, Loader2, UserCheck, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { saveVolunteerHoursAction, updateApplicationStatusAction } from "@/lib/actions/applications";
import { initials } from "@/lib/utils";
import type { ProjectApplication, PublicProfile, VolunteerHours } from "@/types/app";

export type ManagedApplication = ProjectApplication & { volunteer: PublicProfile | null; hours: VolunteerHours | null };

export function ApplicationManager({ applications, projectHours }: { applications: ManagedApplication[]; projectHours: number }) {
  if (!applications.length) return <div className="rounded-2xl border border-dashed bg-white p-10 text-center"><UserCheck className="mx-auto size-8 text-green-600" /><h3 className="mt-4 font-black">Заявок пока нет</h3><p className="mt-2 text-sm text-muted-foreground">После откликов волонтёров участники появятся здесь.</p></div>;
  return <div className="grid gap-4">{applications.map((application) => <ParticipantRow key={application.id} application={application} projectHours={projectHours} />)}</div>;
}

function ParticipantRow({ application, projectHours }: { application: ManagedApplication; projectHours: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [hours, setHours] = useState(String(application.hours?.hours ?? projectHours));
  const [hourStatus, setHourStatus] = useState<"pending" | "confirmed" | "rejected">(application.hours?.status ?? "pending");
  const setStatus = async (status: "approved" | "rejected" | "attended" | "completed") => { setPending(true); const result = await updateApplicationStatusAction(application.id, application.project_id, status); setPending(false); if (result.success) { toast.success("Статус обновлён"); router.refresh(); } else toast.error(result.error); };
  const saveHours = async () => { setPending(true); const result = await saveVolunteerHoursAction({ applicationId: application.id, volunteerId: application.volunteer_id, projectId: application.project_id, hours: Number(hours), status: hourStatus }); setPending(false); if (result.success) { toast.success(hourStatus === "confirmed" ? "Часы подтверждены, сертификат создан" : "Часы сохранены"); router.refresh(); } else toast.error(result.error); };
  return <div className="rounded-2xl border bg-white p-5"><div className="flex flex-col gap-5 lg:flex-row lg:items-center"><div className="flex min-w-0 flex-1 items-center gap-4"><Avatar className="size-12"><AvatarImage src={application.volunteer?.avatar_url ?? undefined} /><AvatarFallback>{initials(application.volunteer?.full_name)}</AvatarFallback></Avatar><div className="min-w-0"><Link href={`/volunteers/${application.volunteer_id}`} target="_blank" className="truncate font-black hover:text-green-700">{application.volunteer?.full_name ?? "Волонтёр"}</Link><p className="mt-1 text-xs text-muted-foreground">{application.volunteer?.city ?? "Город не указан"}</p></div></div><StatusBadge status={application.status} /><div className="flex flex-wrap gap-2">{application.status === "pending" ? <><Button size="sm" disabled={pending} onClick={() => setStatus("approved")}><Check />Принять</Button><Button size="sm" variant="outline" disabled={pending} onClick={() => setStatus("rejected")}><X />Отклонить</Button></> : null}{application.status === "approved" ? <><Button size="sm" disabled={pending} onClick={() => setStatus("attended")}><UserCheck />Отметить участие</Button><Button size="sm" variant="outline" disabled={pending} onClick={() => setStatus("rejected")}><X />Отклонить</Button></> : null}{pending ? <Loader2 className="size-5 animate-spin text-green-600" /> : null}</div></div>{["attended", "completed"].includes(application.status) ? <div className="mt-5 grid gap-3 border-t pt-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><div><label className="mb-2 block text-xs font-bold text-muted-foreground">Фактические часы</label><Input type="number" min="0" max="1000" step="0.5" value={hours} onChange={(event) => setHours(event.target.value)} /></div><div><label className="mb-2 block text-xs font-bold text-muted-foreground">Статус часов</label><select value={hourStatus} onChange={(event) => setHourStatus(event.target.value as typeof hourStatus)} className="h-11 w-full rounded-xl border bg-white px-3 text-sm"><option value="pending">На проверке</option><option value="confirmed">Подтверждено</option><option value="rejected">Отклонено</option></select></div><Button onClick={saveHours} disabled={pending}><Clock3 />Сохранить часы</Button></div> : null}</div>;
}
