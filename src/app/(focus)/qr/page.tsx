import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { QrScreen, QrEmpty } from "@/components/volunteer/qr-screen";
import { getCurrentProfile } from "@/lib/auth";
import { checkinUrl } from "@/lib/checkin";
import { getServerDictionary } from "@/lib/i18n/server";
import { qrSvgPath } from "@/lib/qr";
import { getMyApplications, isUpcoming } from "@/lib/queries/volunteer";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerDictionary();
  return { title: t.volunteer.qr.title };
}

export default async function QrPage({ searchParams }: { searchParams: Promise<{ application?: string }> }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/auth/login?next=/qr");
  if (!profile.onboarded_at) redirect("/organizations?next=/qr");
  if (profile.role !== "volunteer") redirect("/dashboard");

  const { application: requested } = await searchParams;
  const now = Date.now();
  const candidates = (await getMyApplications(profile.id))
    .filter((application) => (application.status === "approved" || application.status === "attended") && application.checkinCode && isUpcoming(application, now))
    .sort((a, b) => a.project.startDate.localeCompare(b.project.startDate));

  const selected = candidates.find((application) => application.id === requested)
    ?? candidates.find((application) => application.status === "approved")
    ?? candidates[0];
  if (!selected?.checkinCode) return <QrEmpty />;

  const others = candidates
    .filter((application) => application.id !== selected.id && application.status === "approved")
    .map((application) => ({ id: application.id, title: application.project.title, startDate: application.project.startDate }));
  const content = checkinUrl(selected.checkinCode);

  return (
    <QrScreen
      key={selected.id}
      application={{ id: selected.id, status: selected.status, title: selected.project.title, startDate: selected.project.startDate }}
      volunteerName={profile.full_name}
      qr={{ ...qrSvgPath(content), content }}
      others={others}
    />
  );
}
