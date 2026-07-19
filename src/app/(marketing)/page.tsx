import { LandingPage } from "@/components/marketing/landing-page";
import { getPlatformStats, getPopularProjects } from "@/lib/queries/projects";

export default async function HomePage() {
  const [stats, projects] = await Promise.all([getPlatformStats(), getPopularProjects(3)]);
  return <LandingPage stats={stats} projects={projects} />;
}
