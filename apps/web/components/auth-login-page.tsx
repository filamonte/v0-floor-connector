import Link from "next/link";

import { AuthField } from "@/components/auth-field";
import { AuthShell } from "@/components/auth-shell";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import {
  signInWithGoogleAction,
  signInWithPasswordAction
} from "@/lib/auth/actions";
import {
  getAuthSurfaceContext,
  getSafeInternalRedirectPath,
  forgotPasswordPath,
  sanitizeRedirectPath,
  signUpPath
} from "@/lib/auth/paths";
import { redirectIfAuthenticated } from "@/lib/auth/session";

type AuthLoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

export async function AuthLoginPage({ searchParams }: AuthLoginPageProps) {
  const params = (await searchParams) ?? {};
  const next = sanitizeRedirectPath(params.next);
  const formNext = getSafeInternalRedirectPath(params.next) ?? "";
  const nextQuery = formNext ? `?next=${encodeURIComponent(formNext)}` : "";
  const surfaceContext = getAuthSurfaceContext(next);

  await redirectIfAuthenticated(formNext);

  return (
    <AuthShell
      eyebrow={surfaceContext.shellEyebrow}
      title="Log in to continue"
      description={`Use Google for the preferred sign-in flow, or use email and password when you need the fallback path. After sign-in, you will return to the same ${surfaceContext.surfaceKey === "portal" ? "portal" : surfaceContext.surfaceKey === "superAdmin" ? "admin" : "workspace"} destination.`}
      error={params.error}
      message={params.message}
      surfaceContext={surfaceContext}
      footer={
        <>
          Need an account?{" "}
          <Link
            href={`${signUpPath}${nextQuery}`}
            className="font-medium text-brand-700"
          >
            Create one
          </Link>
        </>
      }
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-sm font-medium text-slate-900">
            Recommended sign-in
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Google is the primary login method for FloorConnector. Use email and
            password below when you need the fallback path for this same destination.
          </p>
        </div>

        <form action={signInWithGoogleAction} className="space-y-3">
          <input type="hidden" name="next" value={formNext} />
          <AuthSubmitButton pendingLabel="Redirecting to Google..." className="sm:w-full">
            <span className="text-base" aria-hidden="true">
              G
            </span>
            <span>{`Continue with Google`}</span>
          </AuthSubmitButton>
          <p className="text-xs leading-5 text-slate-500">
            {surfaceContext.nextStepDescription}
          </p>
        </form>

        <div className="flex items-center gap-3 py-2">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
            Email login
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <form action={signInWithPasswordAction} className="space-y-4">
          <input type="hidden" name="next" value={formNext} />
          <div className="grid gap-4">
            <AuthField
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@company.com"
              hint="Use the email address attached to your FloorConnector account."
              required
            />
            <AuthField
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              hint="Passwords are only used for the email fallback flow."
              required
            />
          </div>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <AuthSubmitButton
              pendingLabel="Signing in..."
              variant="secondary"
              className="sm:min-w-[190px]"
            >
              <span>Log in with email</span>
            </AuthSubmitButton>
            <Link
              href={forgotPasswordPath}
              className="text-sm font-medium text-brand-700"
            >
              Forgot password?
            </Link>
          </div>
        </form>
      </div>
    </AuthShell>
  );
}
