import type { Metadata } from "next";
import { ApplicationsView, type ApplicationCard } from "@/components/volunteer/applications-view";
import { requireRole } from "@/lib/auth";
import { getServerDictionary } from "@/lib/i18n/server";
import { getMyApplications, getMyCertificates, getMyHours, isUpcoming } from "@/lib/queries/volunteer";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerDictionary();
  return { title: t.volunteer.applications.title };
}

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const profile = await requireRole("volunteer");
  const tab = (await searchParams).tab === "past" ? "past" : "upcoming";
  const [applications, hours, certificates] = await Promise.all([
    getMyApplications(profile.id),
    tab === "past" ? getMyHours(profile.id) : Promise.resolve([]),
    tab === "past" ? getMyCertificates(profile.id) : Promise.resolve([]),
  ]);
  const hoursByProject = new Map(hours.map((entry) => [entry.project.id, entry]));
  const certificateByProject = new Map(certificates.map((certificate) => [certificate.projectId, certificate]));
  const now = Date.now();

  const items: ApplicationCard[] = applications
    .filter((application) => (tab === "upcoming" ? isUpcoming(application, now) : !isUpcoming(application, now)))
    .sort((a, b) => (tab === "upcoming"
      ? a.project.startDate.localeCompare(b.project.startDate)
      : b.project.startDate.localeCompare(a.project.startDate)))
    .map((application) => {
      const entry = hoursByProject.get(application.project.id);
      return {
        id: application.id,
        status: application.status,
        projectId: application.project.id,
        title: application.project.title,
        organizationName: application.project.organizationName,
        startDate: application.project.startDate,
        hours: entry ? { hours: entry.hours, status: entry.status } : null,
        certificateUrl: certificateByProject.get(application.project.id)?.url ?? null,
      };
    });

  return <ApplicationsView key={tab} tab={tab} items={items} />;
}
