// FILE: src/app/auth/callback/route.ts
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createRouteClient } from "@/lib/supabase/route";

function buildRedirectUrl(request: NextRequest, pathname: string, error?: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";

  if (error) {
    url.searchParams.set("error", error);
  }

  return url;
}

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.redirect(buildRedirectUrl(request, "/login", "supabase_not_configured"));
  }

  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const next = request.nextUrl.searchParams.get("next");
  const safeNext = next?.startsWith("/") ? next : "/analyze";
  const successResponse = NextResponse.redirect(buildRedirectUrl(request, safeNext));
  const { supabase, getResponse } = createRouteClient(request, successResponse);

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(buildRedirectUrl(request, "/login", "auth_callback_failed"));
    }

    return getResponse();
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (error) {
      return NextResponse.redirect(buildRedirectUrl(request, "/login", "otp_verification_failed"));
    }

    return getResponse();
  }

  return NextResponse.redirect(buildRedirectUrl(request, "/login", "missing_auth_code"));
}
