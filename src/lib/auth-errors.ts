import type { Dictionary } from "@/lib/i18n/dictionaries";

type AuthErrorLike = { code?: string; status?: number; message?: string; name?: string } | null | undefined;
export type AuthErrorKey = keyof Dictionary["auth"]["errors"];

/**
 * Maps a Supabase Auth error to a translated message key. Raw API messages are
 * never shown to the user.
 */
export function authErrorKey(error: AuthErrorLike): AuthErrorKey {
  if (!error) return "generic";
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();

  if (code === "invalid_credentials" || message.includes("invalid login credentials")) return "invalidCredentials";
  if (code === "email_not_confirmed" || message.includes("email not confirmed")) return "emailNotConfirmed";
  if (code === "user_already_exists" || code === "email_exists" || message.includes("already registered")) return "userExists";
  if (code === "weak_password" || message.includes("password should")) return "weakPassword";
  if (code === "same_password") return "samePassword";
  if (error.status === 429 || code.startsWith("over_") || message.includes("rate limit")) return "rateLimit";
  if (error.name === "AuthRetryableFetchError" || error.status === 0 || message.includes("fetch")) return "network";
  return "generic";
}

export function authErrorText(error: AuthErrorLike, t: Dictionary) {
  return t.auth.errors[authErrorKey(error)];
}

/** Translates a zod message from src/lib/validations.ts; unknown messages get a neutral fallback. */
export function validationText(message: string | undefined, t: Dictionary) {
  if (!message) return "";
  const map: Readonly<Record<string, string>> = t.auth.validation;
  return map[message] ?? t.auth.validation.fallback;
}
