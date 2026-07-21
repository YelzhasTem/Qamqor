"use client";

import { useState } from "react";
import { Loader2, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteVolunteerUserAction, setUserRoleAction } from "@/lib/actions/admin";
import type { UserRole } from "@/types/roles";

export function UserRoleManager({ userId, fullName, role }: { userId: string; fullName: string; role: UserRole }) {
  const [pendingAction, setPendingAction] = useState<"role" | "delete" | null>(null);
  const router = useRouter();

  if (role === "admin") return <span className="text-xs font-semibold text-muted-foreground">Защищённая роль</span>;

  const nextRole = role === "coordinator" ? "volunteer" : "coordinator";
  const promote = nextRole === "coordinator";
  const updateRole = async () => {
    const question = promote
      ? `Назначить ${fullName} координатором?`
      : `Снять роль координатора у ${fullName}?`;
    if (!window.confirm(question)) return;

    setPendingAction("role");
    const result = await setUserRoleAction({ userId, role: nextRole });
    setPendingAction(null);
    if (!result.success) return toast.error(result.error);
    toast.success(promote ? "Роль координатора назначена" : "Пользователь снова стал волонтёром");
    router.refresh();
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm(
      `Удалить аккаунт «${fullName}»? Профиль, заявки, часы, сертификаты и достижения будут удалены без возможности восстановления.`,
    );
    if (!confirmed) return;

    setPendingAction("delete");
    const result = await deleteVolunteerUserAction({ userId });
    setPendingAction(null);
    if (!result.success) return toast.error(result.error);
    toast.success("Аккаунт волонтёра удалён");
    router.refresh();
  };

  const pending = pendingAction !== null;

  return <div className="flex flex-wrap justify-end gap-2">
    <Button size="sm" variant={promote ? "default" : "outline"} disabled={pending} onClick={updateRole}>
      {pendingAction === "role" ? <Loader2 className="animate-spin" /> : promote ? <ShieldCheck /> : <UserRound />}
      {promote ? "Назначить координатором" : "Сделать волонтёром"}
    </Button>
    {role === "volunteer" ? <Button size="sm" variant="outline" className="text-danger-foreground hover:bg-danger/10 hover:text-danger-foreground" disabled={pending} onClick={deleteAccount}>
      {pendingAction === "delete" ? <Loader2 className="animate-spin" /> : <Trash2 />}
      Удалить аккаунт
    </Button> : null}
  </div>;
}
