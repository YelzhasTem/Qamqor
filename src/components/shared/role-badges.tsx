import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@/types/roles";

export function RoleBadges({ role }: { role: UserRole }) {
  if (role === "admin") {
    return <div className="flex flex-wrap gap-2"><Badge>Администратор</Badge><Badge variant="secondary">Координатор</Badge></div>;
  }
  if (role === "coordinator") return <Badge variant="secondary">Координатор</Badge>;
  return <Badge variant="muted">Волонтёр</Badge>;
}
