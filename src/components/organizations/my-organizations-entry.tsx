"use client";

import Link from "next/link";
import { Building2, ChevronRight } from "lucide-react";
import { useLanguage } from "@/components/i18n/language-provider";
import { fill } from "@/lib/i18n/format";

/** Profile entry that opens the organization picker so the choice can be changed later. */
export function MyOrganizationsEntry({ count }: { count: number }) {
  const { t } = useLanguage();
  return (
    <Link
      href="/organizations?next=/profile"
      className="mt-5 flex min-h-[72px] items-center gap-4 rounded-row border border-hairline bg-surface p-4 transition-colors hover:bg-page"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-inset text-ink"><Building2 aria-hidden="true" className="size-5" /></span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold">{t.organizations.myOrganizations}</span>
        <span className="mt-0.5 block text-sm text-ink-secondary">{count > 0 ? fill(t.organizations.myOrganizationsCount, { count }) : t.organizations.myOrganizationsText}</span>
      </span>
      <span className="flex items-center gap-1 text-sm font-semibold text-ink-secondary">{t.organizations.manage}<ChevronRight aria-hidden="true" className="size-4" /></span>
    </Link>
  );
}
