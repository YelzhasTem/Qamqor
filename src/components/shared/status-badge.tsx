import { Badge } from "@/components/ui/badge";

const statusLabels: Record<string, string> = {
  draft: "Черновик",
  published: "Опубликован",
  completed: "Завершён",
  cancelled: "Отменён",
  pending: "На рассмотрении",
  approved: "Одобрено",
  rejected: "Отклонено",
  attended: "Участие отмечено",
  confirmed: "Подтверждено",
};

export function StatusBadge({ status }: { status: string }) {
  const variant = status === "approved" || status === "confirmed" || status === "completed"
    ? "success"
    : status === "published" || status === "attended"
      ? "info"
    : status === "rejected" || status === "cancelled"
      ? "danger"
      : status === "pending" || status === "draft"
        ? "warning"
        : "secondary";
  return <Badge variant={variant}>{statusLabels[status] ?? status}</Badge>;
}
