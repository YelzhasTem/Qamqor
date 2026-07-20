"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/profile";

const roleChangeSchema = z.object({
  userId: z.uuid(),
  role: z.enum(["volunteer", "coordinator"]),
});

export async function setUserRoleAction(input: unknown): Promise<ActionResult> {
  await requireRole("admin");
  const parsed = roleChangeSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Некорректные данные пользователя" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_user_role", {
    target_user_id: parsed.data.userId,
    new_role: parsed.data.role,
  });
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/users");
  return { success: true };
}
