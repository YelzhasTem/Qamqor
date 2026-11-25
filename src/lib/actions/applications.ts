"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/profile";
import { toErrorCode } from "@/lib/errors";
import type { Database } from "@/types/database";

type ApplicationStatus = Database["public"]["Enums"]["application_status"];

function revalidateVolunteerScreens(projectId: string) {
  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/applications");
  revalidatePath("/dashboard");
  revalidatePath("/qr");
}

/**
 * Applies through public.apply_to_project, which joins the organization when
 * needed. Errors come back as stable codes (src/lib/errors.ts), never as raw
 * database text.
 */
export async function applyToProjectAction(projectId: string): Promise<ActionResult<{ applicationId: string; status: ApplicationStatus }>> {
  await requireRole("volunteer");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("apply_to_project", { target: projectId });
  if (error || !data) return { success: false, error: toErrorCode(error) };
  revalidateVolunteerScreens(projectId);
  revalidatePath("/profile");
  return { success: true, data: { applicationId: data.id, status: data.status } };
}

/** Deletes the caller's own pending or approved application (RLS decides). */
export async function cancelApplicationAction(applicationId: string, projectId: string): Promise<ActionResult> {
  const profile = await requireRole("volunteer");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_applications")
    .delete()
    .eq("id", applicationId)
    .eq("volunteer_id", profile.id)
    .select("id");
  if (error) return { success: false, error: toErrorCode(error) };
  if (!data?.length) return { success: false, error: "unknown" };
  revalidateVolunteerScreens(projectId);
  return { success: true };
}

export async function updateApplicationStatusAction(applicationId: string, projectId: string, status: ApplicationStatus): Promise<ActionResult> {
  await requireRole("coordinator");
  if (!["approved", "rejected", "attended", "completed"].includes(status)) return { success: false, error: "Недопустимый статус" };
  const supabase = await createClient();
  const { error } = await supabase.from("project_applications").update({ status }).eq("id", applicationId).eq("project_id", projectId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  revalidatePath(`/coordinator/projects/${projectId}/applications`);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/my-projects");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function saveVolunteerHoursAction(input: { applicationId: string; volunteerId: string; projectId: string; hours: number; status: "pending" | "confirmed" | "rejected" }): Promise<ActionResult> {
  const profile = await requireRole("coordinator");
  const supabase = await createClient();
  const { data: application } = await supabase.from("project_applications").select("id, volunteer_id, project_id").eq("id", input.applicationId).eq("project_id", input.projectId).eq("volunteer_id", input.volunteerId).maybeSingle();
  if (!application) return { success: false, error: "Заявка не найдена" };
  const { error } = await supabase.from("volunteer_hours").upsert({
    volunteer_id: input.volunteerId,
    project_id: input.projectId,
    hours: Number(input.hours),
    status: input.status,
    confirmed_by: profile.id,
  }, { onConflict: "volunteer_id,project_id" });
  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  revalidatePath(`/coordinator/projects/${input.projectId}/applications`);
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { success: true };
}
