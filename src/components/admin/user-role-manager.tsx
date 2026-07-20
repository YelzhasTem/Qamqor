"use client";

import { useState } from "react";
import { Loader2, ShieldCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setUserRoleAction } from "@/lib/actions/admin";
import type { UserRole } from "@/types/roles";

export function UserRoleManager({ userId, fullName, role }: { userId: string; fullName: string; role: UserRole }) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  if (role === "admin") return <span className="text-xs font-semibold text-muted-foreground">Защищённая роль</span>;

  const nextRole = role === "coordinator" ? "volunteer" : "coordinator";
  const promote = nextRole === "coordinator";
  const updateRole = async () => {
    const question = promote
      ? `Назначить ${fullName} координатором?`
      : `Снять роль координатора у ${fullName}?`;
    if (!window.confirm(question)) return;

    setPending(true);
    const result = await setUserRoleAction({ userId, role: nextRole });
    setPending(false);
    if (!result.success) return toast.error(result.error);
    toast.success(promote ? "Роль координатора назначена" : "Пользователь снова стал волонтёром");
    router.refresh();
  };

  return <Button size="sm" variant={promote ? "default" : "outline"} disabled={pending} onClick={updateRole}>
    {pending ? <Loader2 className="animate-spin" /> : promote ? <ShieldCheck /> : <UserRound />}
    {promote ? "Назначить координатором" : "Сделать волонтёром"}
  </Button>;
}
