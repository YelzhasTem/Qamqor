import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CoordinatorDashboard } from "@/components/dashboard/coordinator-dashboard";
import { VolunteerDashboard } from "@/components/dashboard/volunteer-dashboard";
import { getCurrentProfile } from "@/lib/auth";
import { isCoordinatorRole } from "@/types/roles";

export const metadata: Metadata = { title: "Личный кабинет" };

export default async function CabinetPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/auth/login");
  return isCoordinatorRole(profile.role)
    ? <CoordinatorDashboard profile={profile} />
    : <VolunteerDashboard profile={profile} />;
}
