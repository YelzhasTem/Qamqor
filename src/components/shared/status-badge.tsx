"use client";

import type { LucideIcon } from "lucide-react";
import { Ban, BadgeCheck, CheckCircle2, Clock3, FilePen, Hourglass, Megaphone, UserCheck, XCircle } from "lucide-react";
import { useLanguage } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

type ApplicationStatus = Database["public"]["Enums"]["application_status"];
type HoursStatus = Database["public"]["Enums"]["hour_status"];
type ProjectStatus = Database["public"]["Enums"]["project_status"];

type Tone = "waiting" | "positive" | "negative" | "info" | "neutral";

const toneClasses: Record<Tone, string> = {
  waiting: "bg-waiting text-waiting-foreground",
  positive: "bg-positive text-positive-foreground",
  negative: "bg-negative text-negative-foreground",
  info: "bg-informative text-informative-foreground",
  neutral: "bg-inset text-ink-muted",
};

type Visual = { tone: Tone; icon: LucideIcon };

/**
 * The one place that maps every application, hours and project status to a
 * label, a colour pair and an icon. Status is never shown by colour alone.
 */
const application: Record<ApplicationStatus, Visual> = {
  pending: { tone: "waiting", icon: Clock3 },
  approved: { tone: "positive", icon: CheckCircle2 },
  rejected: { tone: "negative", icon: XCircle },
  attended: { tone: "info", icon: UserCheck },
  completed: { tone: "positive", icon: BadgeCheck },
};

const hours: Record<HoursStatus, Visual> = {
  pending: { tone: "waiting", icon: Hourglass },
  confirmed: { tone: "positive", icon: CheckCircle2 },
  rejected: { tone: "negative", icon: XCircle },
};

const project: Record<ProjectStatus, Visual> = {
  draft: { tone: "neutral", icon: FilePen },
  published: { tone: "info", icon: Megaphone },
  completed: { tone: "positive", icon: BadgeCheck },
  cancelled: { tone: "negative", icon: Ban },
};

export type StatusKind = "application" | "hours" | "project";

function inferKind(status: string): StatusKind {
  if (status in application) return "application";
  if (status in hours) return "hours";
  return "project";
}

export function StatusBadge({ status, kind, className }: { status: string; kind?: StatusKind; className?: string }) {
  const { t } = useLanguage();
  const resolvedKind = kind ?? inferKind(status);
  const visuals: Record<string, Visual> = resolvedKind === "application" ? application : resolvedKind === "hours" ? hours : project;
  const labels: Record<string, string> = t.statuses[resolvedKind];
  const visual = visuals[status] ?? { tone: "neutral" as const, icon: Clock3 };
  const Icon = visual.icon;
  const label = labels[status] ?? status;

  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full py-1 pr-2.5 pl-2 text-xs font-semibold leading-4", toneClasses[visual.tone], className)}>
      <Icon aria-hidden="true" className="size-3.5 shrink-0" />
      {label}
    </span>
  );
}
