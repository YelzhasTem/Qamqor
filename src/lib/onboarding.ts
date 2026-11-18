import { safeRedirect } from "@/lib/utils";

export const ORGANIZATION_PICKER_PATH = "/organizations";

/**
 * Where to send a user right after sign-in or e-mail confirmation. Users who
 * have not finished onboarding go to the organization picker first; the
 * original destination is carried along as `next`.
 */
export function postSignInPath(onboardedAt: string | null | undefined, next?: string | null) {
  const destination = safeRedirect(next);
  if (onboardedAt || destination.startsWith("/auth/")) return destination;
  return destination === "/dashboard"
    ? ORGANIZATION_PICKER_PATH
    : `${ORGANIZATION_PICKER_PATH}?next=${encodeURIComponent(destination)}`;
}
