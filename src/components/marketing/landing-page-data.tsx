import { LandingPage } from "@/components/marketing/landing-page";
import { getPlatformStats, getPopularProjects } from "@/lib/queries/projects";

export async function LandingPageData() {
  const [stats, projects] = await Promise.all([getPlatformStats(), getPopularProjects(3)]);
  return <LandingPage stats={stats} projects={projects} />;
}
