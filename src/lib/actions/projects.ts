"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { projectSchema } from "@/lib/validations";
import type { ActionResult } from "@/lib/actions/profile";

async function uploadCover(file: File, userId: string) {
  if (file.size > 5 * 1024 * 1024) throw new Error("Максимальный размер изображения — 5 МБ");
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Поддерживаются JPG, PNG и WebP");
  const supabase = await createClient();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/cover-${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("project-covers").upload(path, file, { cacheControl: "3600" });
  if (error) throw new Error(error.message);
  return supabase.storage.from("project-covers").getPublicUrl(path).data.publicUrl;
}

function projectFormValues(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  let benefits: unknown = [];
  try {
    benefits = JSON.parse(String(formData.get("benefits") ?? "[]"));
  } catch {
    benefits = [];
  }
  return { ...raw, benefits };
}

async function projectCoverFromForm(formData: FormData, userId: string, existingCover: string | null = null) {
  const cover = formData.get("cover");
  if (cover instanceof File && cover.size > 0) return uploadCover(cover, userId);
  return existingCover;
}

export async function createProjectAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const profile = await requireRole("coordinator");
  const parsed = projectSchema.safeParse(projectFormValues(formData));
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Проверьте данные проекта" };

  let coverUrl: string | null = null;
  try {
    coverUrl = await projectCoverFromForm(formData, profile.id);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Не удалось загрузить изображение" };
  }

  const supabase = await createClient();
  const { whatsapp_group_url: whatsappGroupUrl, status: requestedStatus, ...projectValues } = parsed.data;
  const { data, error } = await supabase.from("projects").insert({
    ...projectValues,
    address: projectValues.address || null,
    requirements: projectValues.requirements || null,
    cover_url: coverUrl,
    coordinator_id: profile.id,
    start_date: new Date(projectValues.start_date).toISOString(),
    end_date: new Date(projectValues.end_date).toISOString(),
    status: "draft",
  }).select("id").single();

  if (error) return { success: false, error: error.message };

  const { error: groupError } = await supabase.from("project_whatsapp_groups").insert({
    project_id: data.id,
    whatsapp_group_url: whatsappGroupUrl,
  });
  if (groupError) {
    await supabase.from("projects").delete().eq("id", data.id).eq("coordinator_id", profile.id);
    return { success: false, error: groupError.message };
  }

  if (requestedStatus === "published") {
    const { error: publishError } = await supabase.from("projects").update({ status: "published" }).eq("id", data.id).eq("coordinator_id", profile.id);
    if (publishError) {
      await supabase.from("projects").delete().eq("id", data.id).eq("coordinator_id", profile.id);
      return { success: false, error: publishError.message };
    }
  }
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/coordinator/projects");
  revalidatePath("/dashboard");
  revalidatePath("/cabinet");
  return { success: true, data: { id: data.id } };
}

export async function saveProjectAction(projectId: string, formData: FormData): Promise<ActionResult<{ id: string }>> {
  const profile = await requireRole("coordinator");
  const supabase = await createClient();
  const { data: existingProject } = await supabase.from("projects").select("id").eq("id", projectId).eq("coordinator_id", profile.id).maybeSingle();
  if (!existingProject) return { success: false, error: "Проект не найден" };

  const parsed = projectSchema.safeParse(projectFormValues(formData));
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Проверьте данные проекта" };

  let coverUrl = typeof formData.get("existing_cover_url") === "string" ? String(formData.get("existing_cover_url")) || null : null;
  try {
    coverUrl = await projectCoverFromForm(formData, profile.id, coverUrl);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Не удалось загрузить изображение" };
  }

  const { whatsapp_group_url: whatsappGroupUrl, ...projectValues } = parsed.data;
  const { error: groupError } = await supabase.from("project_whatsapp_groups").upsert({
    project_id: projectId,
    whatsapp_group_url: whatsappGroupUrl,
  }, { onConflict: "project_id" });
  if (groupError) return { success: false, error: groupError.message };

  const payload = {
    ...projectValues,
    address: projectValues.address || null,
    requirements: projectValues.requirements || null,
    cover_url: coverUrl,
    coordinator_id: profile.id,
    start_date: new Date(projectValues.start_date).toISOString(),
    end_date: new Date(projectValues.end_date).toISOString(),
  };
  const { data, error } = await supabase.from("projects").update(payload).eq("id", projectId).eq("coordinator_id", profile.id).select("id").single();
  if (error) return { success: false, error: error.message };
  revalidatePath("/projects");
  revalidatePath("/coordinator/projects");
  revalidatePath("/dashboard");
  revalidatePath("/cabinet");
  revalidatePath(`/projects/${projectId}`);
  return { success: true, data: { id: data.id } };
}

export async function deleteProjectAction(projectId: string): Promise<ActionResult> {
  const profile = await requireRole("coordinator");
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", projectId).eq("coordinator_id", profile.id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/projects");
  revalidatePath("/coordinator/projects");
  revalidatePath("/dashboard");
  revalidatePath("/cabinet");
  return { success: true };
}

export async function setProjectStatusAction(projectId: string, status: "draft" | "published" | "completed" | "cancelled"): Promise<ActionResult> {
  const profile = await requireRole("coordinator");
  const supabase = await createClient();
  const { error } = await supabase.from("projects").update({ status }).eq("id", projectId).eq("coordinator_id", profile.id);
  if (error) return { success: false, error: error.message };
  if (status === "completed") {
    await supabase.from("project_applications").update({ status: "completed" }).eq("project_id", projectId).in("status", ["approved", "attended"]);
  }
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/coordinator/projects");
  revalidatePath("/dashboard");
  revalidatePath("/cabinet");
  return { success: true };
}
