import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCoordinatorRole, type UserRole } from "@/types/roles";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return data;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  return user;
}

export async function requireRole(role: UserRole) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/auth/login");
  const hasRole = role === "coordinator" ? isCoordinatorRole(profile.role) : profile.role === role;
  if (!hasRole) redirect("/dashboard");
  return profile;
}
