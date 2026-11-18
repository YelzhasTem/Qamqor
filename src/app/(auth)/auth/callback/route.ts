import { type NextRequest, NextResponse } from "next/server";
import { postSignInPath } from "@/lib/onboarding";
import { createClient } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeRedirect(request.nextUrl.searchParams.get("next"));
  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Users who have not picked organizations yet go to the picker first.
      const userId = data.user?.id;
      const { data: profile } = userId
        ? await supabase.from("profiles").select("onboarded_at").eq("id", userId).maybeSingle()
        : { data: null };
      return NextResponse.redirect(new URL(postSignInPath(profile?.onboarded_at, next), request.url));
    }

    const isDifferentBrowser = error.code === "pkce_code_verifier_not_found"
      || error.code === "bad_code_verifier"
      || error.name === "AuthPKCECodeVerifierMissingError";
    if (isDifferentBrowser && next === "/dashboard") {
      return NextResponse.redirect(new URL("/auth/confirmed?handoff=1", request.url));
    }
  }
  return NextResponse.redirect(new URL("/auth/login?error=callback", request.url));
}
