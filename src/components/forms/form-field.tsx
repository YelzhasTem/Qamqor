import { Label } from "@/components/ui/label";

/** Visible label, the control, and an error line linked by aria-describedby. */
export function FormField({ id, label, error, aside, children }: { id: string; label: string; error?: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        {aside}
      </div>
      {children}
      {error ? <p id={`${id}-error`} className="text-sm leading-5 text-negative-foreground">{error}</p> : null}
    </div>
  );
}

export function fieldA11y(id: string, error?: string) {
  return error ? { "aria-invalid": true as const, "aria-describedby": `${id}-error` } : {};
}
