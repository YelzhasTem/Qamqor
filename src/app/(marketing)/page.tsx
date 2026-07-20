import { LandingPage } from "@/components/marketing/landing-page";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPlatformStats, getPopularProjects } from "@/lib/queries/projects";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const [stats, projects] = await Promise.all([getPlatformStats(), getPopularProjects(3)]);
  return <LandingPage stats={stats} projects={projects} />;
}
