// The one place that turns database and API errors into messages for people.
// Database functions raise stable codes (see the migration
// 20261125090000_application_guards_and_checkin_codes.sql); raw error text is
// never shown to a user.
import type { Dictionary } from "@/lib/i18n/dictionaries";

export const appErrorCodes = [
  "not_authenticated",
  "not_a_volunteer",
  "project_not_open",
  "project_full",
  "already_applied",
  "organization_not_active",
  "not_a_member",
  "staff_cannot_leave",
  "organization_not_found",
  "invalid_input",
  "file_too_large",
  "file_type",
  "unknown",
] as const;

export type AppErrorCode = (typeof appErrorCodes)[number];

type ErrorLike = { message?: string | null; code?: string | null } | null | undefined;

export function isAppErrorCode(value: unknown): value is AppErrorCode {
  return typeof value === "string" && (appErrorCodes as readonly string[]).includes(value);
}

/** Stable code for any Supabase, PostgREST or thrown error. */
export function toErrorCode(error: ErrorLike | unknown): AppErrorCode {
  const value = (error ?? {}) as { message?: unknown; code?: unknown };
  const message = typeof value.message === "string" ? value.message.trim() : "";
  const code = typeof value.code === "string" ? value.code : "";
  if (isAppErrorCode(message)) return message;
  if (code === "23505") return "already_applied";
  if (code === "P0002") return "organization_not_found";
  if (code === "42501" && /coordinator|head|staff/i.test(message)) return "staff_cannot_leave";
  if (code === "QA401" || code === "PGRST301") return "not_authenticated";
  return "unknown";
}

/** Translated message for an error code, for toasts and form messages. */
export function errorText(code: string | null | undefined, t: Dictionary) {
  return t.volunteer.errors[isAppErrorCode(code) ? code : "unknown"];
}
