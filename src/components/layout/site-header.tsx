import { SiteHeaderClient } from "@/components/marketing/site-header-client";
import { getCurrentUser } from "@/lib/auth";
import { getActiveOrganizations } from "@/lib/queries/organizations";

export async function SiteHeader() {
  const [user, organizations] = await Promise.all([getCurrentUser(), getActiveOrganizations().catch(() => [])]);
  return <SiteHeaderClient signedIn={Boolean(user)} showOrganizations={organizations.length > 0} />;
}
