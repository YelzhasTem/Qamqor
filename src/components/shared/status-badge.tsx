"use client";

import { useLanguage } from "@/components/marketing/language-provider";
import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const { copy } = useLanguage();
  const variant = status === "approved" || status === "confirmed" || status === "completed"
    ? "success"
    : status === "published" || status === "attended"
      ? "info"
    : status === "rejected" || status === "cancelled"
      ? "danger"
      : status === "pending" || status === "draft"
        ? "warning"
        : "secondary";
  const label = copy.statuses[status as keyof typeof copy.statuses] ?? status;
  return <Badge variant={variant}>{label}</Badge>;
}
