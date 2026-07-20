import type { Database } from "@/types/database";

export type UserRole = Database["public"]["Enums"]["user_role"];

export function isCoordinatorRole(role: UserRole) {
  return role === "coordinator" || role === "admin";
}

export function roleSummary(role: UserRole) {
  if (role === "admin") return "Администратор · Координатор";
  if (role === "coordinator") return "Координатор";
  return "Волонтёр";
}
