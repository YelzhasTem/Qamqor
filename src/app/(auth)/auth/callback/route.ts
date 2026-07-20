import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeRedirect(request.nextUrl.searchParams.get("next"));
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, request.url));

    const isDifferentBrowser = error.code === "pkce_code_verifier_not_found"
      || error.code === "bad_code_verifier"
      || error.name === "AuthPKCECodeVerifierMissingError";
    if (isDifferentBrowser && next === "/dashboard") {
      return NextResponse.redirect(new URL("/auth/confirmed?handoff=1", request.url));
    }
  }
  return NextResponse.redirect(new URL("/auth/login?error=callback", request.url));
}
