import type { Metadata } from "next";
import { HoursView, type HoursData } from "@/components/volunteer/hours-view";
import { requireRole } from "@/lib/auth";
import { getServerDictionary } from "@/lib/i18n/server";
import { getMyCertificates, getMyHours } from "@/lib/queries/volunteer";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerDictionary();
  return { title: t.volunteer.hours.title };
}

export default async function HoursPage() {
  const profile = await requireRole("volunteer");
  const supabase = await createClient();
  const [entries, certificates, { data: achievements }, { data: earned }] = await Promise.all([
    getMyHours(profile.id),
    getMyCertificates(profile.id),
    supabase.from("achievements").select("id, title, required_hours").order("required_hours", { ascending: true }),
    supabase.from("volunteer_achievements").select("achievement_id, awarded_at").eq("volunteer_id", profile.id),
  ]);

  const confirmed = entries.filter((entry) => entry.status === "confirmed");
  const totalConfirmed = confirmed.reduce((sum, entry) => sum + entry.hours, 0);
  const pendingHours = entries.filter((entry) => entry.status === "pending").reduce((sum, entry) => sum + entry.hours, 0);

  const byOrganization = new Map<string, { name: string | null; hours: number }>();
  for (const entry of confirmed) {
    const key = entry.project.organizationId ?? "none";
    const current = byOrganization.get(key) ?? { name: entry.project.organizationName, hours: 0 };
    current.hours += entry.hours;
    byOrganization.set(key, current);
  }

  const earnedIds = new Set((earned ?? []).map((row) => row.achievement_id));
  const allAchievements = (achievements ?? []).map((row) => ({ id: row.id, title: row.title, requiredHours: Number(row.required_hours) }));
  const data: HoursData = {
    totalConfirmed,
    pendingHours,
    byOrganization: [...byOrganization.values()].sort((a, b) => b.hours - a.hours),
    earnedAchievements: allAchievements.filter((achievement) => earnedIds.has(achievement.id)),
    nextAchievement: allAchievements.find((achievement) => !earnedIds.has(achievement.id) && achievement.requiredHours > totalConfirmed) ?? null,
    certificates: certificates.map((certificate) => ({ id: certificate.id, url: certificate.url, title: certificate.projectTitle, date: certificate.projectEndDate })),
    history: entries.map((entry) => ({
      id: entry.id,
      title: entry.project.title,
      organizationName: entry.project.organizationName,
      date: entry.project.endDate,
      hours: entry.hours,
      status: entry.status,
    })),
  };

  return <HoursView data={data} />;
}
