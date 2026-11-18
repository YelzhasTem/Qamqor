import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrganizationPicker } from "@/components/organizations/organization-picker";
import { getCurrentProfile } from "@/lib/auth";
import { getServerDictionary } from "@/lib/i18n/server";
import { getActiveOrganizations, getMyMemberships } from "@/lib/queries/organizations";
import { safeRedirect } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerDictionary();
  return { title: t.organizations.title };
}

export default async function OrganizationsPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/auth/login?next=/organizations");
  const { next } = await searchParams;
  const [organizations, memberships] = await Promise.all([getActiveOrganizations(), getMyMemberships(profile.id)]);

  return (
    <OrganizationPicker
      organizations={organizations.map(({ id, name, summary, category, logo_url }) => ({ id, name, summary, category, logoUrl: logo_url }))}
      memberships={Object.fromEntries(memberships.map((membership) => [membership.organization_id, membership.role]))}
      next={safeRedirect(next)}
    />
  );
}
