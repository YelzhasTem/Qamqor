"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Pencil, Send, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteProjectAction, setProjectStatusAction } from "@/lib/actions/projects";
import type { Project } from "@/types/app";

export function ProjectAdminActions({ project }: { project: Project }) {
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const update = async (status: "published" | "completed") => { setPending(true); const result = await setProjectStatusAction(project.id, status); setPending(false); if (result.success) toast.success(status === "published" ? "Проект опубликован" : "Проект завершён"); else toast.error(result.error); router.refresh(); };
  return <div className="flex flex-wrap justify-end gap-1"><Button asChild variant="ghost" size="icon" title="Участники"><Link href={`/coordinator/projects/${project.id}/applications`}><Users /></Link></Button><Button asChild variant="ghost" size="icon" title="Редактировать"><Link href={`/coordinator/projects/${project.id}/edit`}><Pencil /></Link></Button>{project.status === "draft" ? <Button variant="ghost" size="icon" title="Опубликовать" disabled={pending} onClick={() => update("published")}>{pending ? <Loader2 className="animate-spin" /> : <Send />}</Button> : null}{project.status === "published" ? <Button variant="ghost" size="icon" title="Завершить" disabled={pending} onClick={() => update("completed")}>{pending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}</Button> : null}<Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50 hover:text-red-700" title="Удалить" disabled={pending} onClick={async () => { if (!window.confirm("Удалить проект и все связанные заявки? Это действие необратимо.")) return; setPending(true); const result = await deleteProjectAction(project.id); setPending(false); if (result.success) { toast.success("Проект удалён"); router.refresh(); } else toast.error(result.error); }}><Trash2 /></Button></div>;
}
