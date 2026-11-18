import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
  children,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: { label: string; href: string };
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-card border border-hairline bg-surface px-6 py-10 text-center", className)}>
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-inset text-ink-muted"><Icon aria-hidden="true" className="size-6" /></div>
      <h3 className="text-base font-extrabold">{title}</h3>
      {description ? <p className="mt-1.5 max-w-sm text-sm leading-6 text-ink-secondary">{description}</p> : null}
      {action ? <Button asChild variant="secondary" className="mt-5"><Link href={action.href}>{action.label}</Link></Button> : null}
      {children}
    </div>
  );
}
