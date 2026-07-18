import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ title, description, icon: Icon = Inbox, action }: { title: string; description: string; icon?: LucideIcon; action?: { label: string; href: string } }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed bg-surface p-8 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="size-6" /></div>
      <h3 className="font-bold">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {action ? <Button asChild className="mt-5"><a href={action.href}>{action.label}</a></Button> : null}
    </div>
  );
}
