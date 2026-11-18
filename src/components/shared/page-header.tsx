import { cn } from "@/lib/utils";

/** Screen title block: optional eyebrow, h1, lead line and trailing actions. */
export function PageHeader({
  title,
  eyebrow,
  description,
  actions,
  className,
}: {
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="text-sm font-semibold text-ink-secondary">{eyebrow}</p> : null}
        <h1 className="mt-1 text-[28px] leading-tight font-extrabold tracking-tight sm:text-[32px]">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-[15px] leading-6 text-ink-secondary">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
