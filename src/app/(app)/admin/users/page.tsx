import type { Metadata } from "next";
import { ShieldCheck, UserCog, UsersRound } from "lucide-react";
import { UserRoleManager } from "@/components/admin/user-role-manager";
import { StatCard } from "@/components/dashboard/stat-card";
import { RoleBadges } from "@/components/shared/role-badges";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate, initials } from "@/lib/utils";
import { isCoordinatorRole } from "@/types/roles";

export const metadata: Metadata = { title: "Управление пользователями" };

export default async function AdminUsersPage() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data: users, error } = await supabase.rpc("admin_list_users");
  if (error) throw new Error("Не удалось загрузить пользователей");

  const coordinators = (users ?? []).filter((user) => isCoordinatorRole(user.role)).length;
  const volunteers = (users ?? []).filter((user) => user.role === "volunteer").length;

  return <div>
    <div>
      <p className="text-sm font-bold text-primary">Администрирование</p>
      <h1 className="mt-1 text-3xl font-black tracking-tight">Пользователи и роли</h1>
      <p className="mt-2 text-sm text-muted-foreground">Назначайте координаторов среди зарегистрированных пользователей. Роль администратора через этот раздел не выдаётся.</p>
    </div>
    <div className="mt-7 grid gap-4 sm:grid-cols-3">
      <StatCard label="Всего пользователей" value={users?.length ?? 0} icon={UsersRound} />
      <StatCard label="Волонтёров" value={volunteers} icon={UsersRound} tone="success" />
      <StatCard label="Координаторов" value={coordinators} icon={UserCog} tone="info" />
    </div>
    <Card className="mt-7 overflow-hidden">
      <CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Пользователь</TableHead><TableHead>Город</TableHead><TableHead>Роли</TableHead><TableHead>Регистрация</TableHead><TableHead className="text-right">Действие</TableHead></TableRow></TableHeader>
          <TableBody>{(users ?? []).map((user) => <TableRow key={user.id}>
            <TableCell><div className="flex items-center gap-3"><Avatar className="size-10"><AvatarImage src={user.avatar_url ?? undefined} /><AvatarFallback>{initials(user.full_name)}</AvatarFallback></Avatar><div className="min-w-0"><p className="truncate font-bold">{user.full_name}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{user.email}</p></div></div></TableCell>
            <TableCell>{user.city ?? "—"}</TableCell>
            <TableCell><RoleBadges role={user.role} /></TableCell>
            <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(user.created_at, "d MMM yyyy")}</TableCell>
            <TableCell className="text-right"><UserRoleManager userId={user.id} fullName={user.full_name} role={user.role} /></TableCell>
          </TableRow>)}</TableBody>
        </Table>
        {!users?.length ? <div className="flex min-h-48 flex-col items-center justify-center p-8 text-center"><ShieldCheck className="size-10 text-primary" /><p className="mt-4 font-bold">Пользователи не найдены</p></div> : null}
      </CardContent>
    </Card>
  </div>;
}
