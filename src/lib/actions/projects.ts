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

export async function saveProjectAction(projectId: string, formData: FormData): Promise<ActionResult<{ id: string }>> {
  const profile = await requireRole("coordinator");
  const supabase = await createClient();
  const { data: existingProject } = await supabase.from("projects").select("id").eq("id", projectId).eq("coordinator_id", profile.id).maybeSingle();
  if (!existingProject) return { success: false, error: "Проект не найден" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Проверьте данные проекта" };

  const cover = formData.get("cover");
  let coverUrl = typeof formData.get("existing_cover_url") === "string" ? String(formData.get("existing_cover_url")) || null : null;
  try {
    if (cover instanceof File && cover.size > 0) coverUrl = await uploadCover(cover, profile.id);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Не удалось загрузить изображение" };
  }

  const payload = {
    ...parsed.data,
    address: parsed.data.address || null,
    requirements: parsed.data.requirements || null,
    cover_url: coverUrl,
    coordinator_id: profile.id,
    start_date: new Date(parsed.data.start_date).toISOString(),
    end_date: new Date(parsed.data.end_date).toISOString(),
  };
  const { data, error } = await supabase.from("projects").update(payload).eq("id", projectId).eq("coordinator_id", profile.id).select("id").single();
  if (error) return { success: false, error: error.message };
  revalidatePath("/projects");
  revalidatePath("/coordinator/projects");
  revalidatePath("/dashboard");
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
  return { success: true };
}
