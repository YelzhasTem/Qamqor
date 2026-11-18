/* eslint-disable @next/next/no-img-element -- logos may come from any storage host */
import { cn } from "@/lib/utils";

/** Initials from the meaningful words of an organization name ("Демо · Экология" -> "ДЭ"). */
export function organizationInitials(name: string) {
  const words = name.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("") || "?";
}

export function OrganizationAvatar({ name, logoUrl, className }: { name: string; logoUrl?: string | null; className?: string }) {
  if (logoUrl) {
    return <img src={logoUrl} alt="" className={cn("size-11 shrink-0 rounded-full border border-hairline bg-surface object-cover", className)} />;
  }
  return (
    <span aria-hidden="true" className={cn("flex size-11 shrink-0 items-center justify-center rounded-full bg-inset text-sm font-extrabold text-ink-muted", className)}>
      {organizationInitials(name)}
    </span>
  );
}
