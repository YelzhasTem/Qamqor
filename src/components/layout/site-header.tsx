import { SiteHeaderClient } from "@/components/marketing/site-header-client";
import { getCurrentUser } from "@/lib/auth";

export async function SiteHeader() {
  const user = await getCurrentUser();
  return <SiteHeaderClient signedIn={Boolean(user)} />;
}
