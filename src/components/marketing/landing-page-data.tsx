import { LandingPage } from "@/components/marketing/landing-page";
import { getCurrentUser } from "@/lib/auth";
import { getActiveOrganizations, getLandingProjects } from "@/lib/queries/organizations";

export async function LandingPageData() {
  const [user, organizations, projects] = await Promise.all([
    getCurrentUser(),
    getActiveOrganizations().catch(() => []),
    getLandingProjects(3).catch(() => []),
  ]);
  return <LandingPage organizations={organizations} projects={projects} signedIn={Boolean(user)} />;
}
