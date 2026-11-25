"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { toErrorCode } from "@/lib/errors";
import { profileSchema } from "@/lib/validations";

/**
 * Result of a server action. Volunteer-facing actions put a stable error code
 * (src/lib/errors.ts) in `error`; the client shows the translated message.
 */
export type ActionResult<T = undefined> = { success: true; data?: T } | { success: false; error: string };

export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "invalid_input" };
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({
    full_name: parsed.data.full_name,
    phone: parsed.data.phone || null,
    bio: parsed.data.bio || null,
  }).eq("id", user.id);
  if (error) return { success: false, error: toErrorCode(error) };
  revalidatePath("/profile");
  revalidatePath(`/volunteers/${user.id}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function uploadAvatarAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  const user = await requireUser();
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) return { success: false, error: "invalid_input" };
  if (file.size > 5 * 1024 * 1024) return { success: false, error: "file_too_large" };
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return { success: false, error: "file_type" };

  const supabase = await createClient();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${user.id}/avatar-${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { cacheControl: "3600", upsert: false });
  if (uploadError) return { success: false, error: toErrorCode(uploadError) };
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  const { error } = await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", user.id);
  if (error) return { success: false, error: toErrorCode(error) };
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath(`/volunteers/${user.id}`);
  return { success: true, data: { url: data.publicUrl } };
}
