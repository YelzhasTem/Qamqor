import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicVolunteerView } from "@/components/volunteers/public-volunteer-view";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("public_volunteer_profiles").select("full_name, bio").eq("id", id).maybeSingle();
  return data ? { title: data.full_name ?? "Волонтёр", description: data.bio ?? "Публичный профиль волонтёра Qamqor" } : { title: "Волонтёр не найден" };
}

export default async function PublicVolunteerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: profile }, { data: projects }, { data: awarded }] = await Promise.all([
    supabase.from("public_volunteer_profiles").select("*").eq("id", id).maybeSingle(),
    supabase.from("public_volunteer_projects").select("*").eq("volunteer_id", id).order("end_date", { ascending: false }),
    supabase.from("volunteer_achievements").select("awarded_at, achievements(*)").eq("volunteer_id", id).order("awarded_at", { ascending: false }),
  ]);
  if (!profile) notFound();
  return <PublicVolunteerView profile={profile} projects={projects ?? []} awarded={awarded ?? []} />;
}
