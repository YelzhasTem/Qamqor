"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/components/i18n/language-provider";
import { OrganizationAvatar } from "@/components/organizations/organization-avatar";
import { Button } from "@/components/ui/button";
import { ConfirmSheet } from "@/components/volunteer/confirm-sheet";
import { errorText, toErrorCode } from "@/lib/errors";
import { fill, plural } from "@/lib/i18n/format";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

export type ProfileOrganization = {
  id: string;
  name: string;
  logoUrl: string | null;
  role: Database["public"]["Enums"]["org_role"];
  /** Upcoming pending and approved applications that leaving would cancel. */
  upcomingApplications: number;
};

export function ProfileOrganizations({ organizations }: { organizations: ProfileOrganization[] }) {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const copy = t.volunteer.profile;
  const [leaving, setLeaving] = useState<ProfileOrganization | null>(null);
  const [pending, setPending] = useState(false);

  async function leave() {
    if (!leaving) return;
    setPending(true);
    const { data, error } = await createClient().rpc("leave_organization", { target: leaving.id });
    setPending(false);
    setLeaving(null);
    if (error) {
      toast.error(errorText(toErrorCode(error), t));
      return;
    }
    const cancelled = Number(data ?? 0);
    toast.success(cancelled > 0 ? plural(locale, cancelled, copy.leftCancelled) : copy.left);
    router.refresh();
  }

  return (
    <>
      {organizations.length ? (
        <ul className="divide-y divide-hairline rounded-card border border-hairline bg-surface">
          {organizations.map((organization) => {
            const staff = organization.role !== "volunteer";
            return (
              <li key={organization.id} className="flex min-h-16 items-center gap-3 px-4 py-3">
                <OrganizationAvatar name={organization.name} logoUrl={organization.logoUrl} />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-bold leading-snug">{organization.name}</p>
                  {staff ? <p className="text-sm text-ink-secondary">{t.organizations.staffRole[organization.role as "coordinator" | "head"]}</p> : null}
                </div>
                {!staff ? (
                  <Button variant="secondary" size="sm" onClick={() => setLeaving(organization)} aria-label={fill(copy.leaveLabel, { name: organization.name })}>
                    {copy.leave}
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-card border border-hairline bg-surface p-4 text-sm text-ink-secondary">{copy.noOrganizations}</p>
      )}
      <Button asChild variant="secondary" className="mt-3 w-full">
        <Link href="/organizations?next=/profile"><Plus />{copy.addOrganizations}</Link>
      </Button>

      <ConfirmSheet
        open={Boolean(leaving)}
        onOpenChange={(open) => { if (!open) setLeaving(null); }}
        title={leaving ? fill(copy.leaveTitle, { name: leaving.name }) : ""}
        text={copy.leaveText}
        extra={leaving && leaving.upcomingApplications > 0 ? plural(locale, leaving.upcomingApplications, copy.leaveCancels) : null}
        confirmLabel={copy.leaveConfirm}
        cancelLabel={copy.leaveKeep}
        onConfirm={() => void leave()}
        pending={pending}
      />
    </>
  );
}
