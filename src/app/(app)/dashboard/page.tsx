import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CoordinatorDashboard } from "@/components/dashboard/coordinator-dashboard";
import { VolunteerDashboard } from "@/components/dashboard/volunteer-dashboard";
import { getCurrentProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "Личный кабинет" };
export default async function DashboardPage() { const profile = await getCurrentProfile(); if (!profile) redirect("/auth/login"); return profile.role === "coordinator" ? <CoordinatorDashboard profile={profile} /> : <VolunteerDashboard profile={profile} />; }
