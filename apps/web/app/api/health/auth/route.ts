import { NextResponse } from "next/server";

import { authCallbackPath, updatePasswordPath } from "@/lib/auth/paths";
import { getAuthCallbackUrl, getAppOrigin } from "@/lib/auth/urls";
import { getPublicEnv } from "@floorconnector/config";

export function GET() {
  const env = getPublicEnv();
  const missing = [
    !env.NEXT_PUBLIC_APP_URL ? "NEXT_PUBLIC_APP_URL" : null,
    !env.NEXT_PUBLIC_SUPABASE_URL ? "NEXT_PUBLIC_SUPABASE_URL" : null,
    !env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : null
  ].filter((value): value is string => Boolean(value));

  return NextResponse.json({
    ok: missing.length === 0,
    service: "web",
    phase: "foundation",
    status: missing.length === 0 ? "configured" : "incomplete",
    appOrigin: getAppOrigin(),
    callbackPath: authCallbackPath,
    callbackUrl: getAuthCallbackUrl(),
    passwordResetCallbackUrl: getAuthCallbackUrl(updatePasswordPath),
    missing,
    requiredSupabaseSettings: {
      siteUrl: getAppOrigin(),
      redirectUrls: [getAuthCallbackUrl(), getAuthCallbackUrl(updatePasswordPath)]
    },
    notes: [
      "Google sign-in must be enabled in the Supabase Auth provider settings.",
      "Email/password sign-in must be enabled in the Supabase Auth provider settings.",
      "If email confirmation is enabled, sign-up will require confirming the email before sign-in."
    ]
  });
}
