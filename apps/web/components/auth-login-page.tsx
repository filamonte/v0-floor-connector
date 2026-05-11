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

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

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
      title="Welcome back"
      description={`Sign in to continue to your ${surfaceContext.surfaceKey === "portal" ? "customer portal" : surfaceContext.surfaceKey === "superAdmin" ? "admin dashboard" : "workspace"}. We recommend using Google for the fastest experience.`}
      error={params.error}
      message={params.message}
      surfaceContext={surfaceContext}
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href={`${signUpPath}${nextQuery}`}
            className="font-semibold text-[var(--copper)] transition hover:text-[var(--copper-light)]"
          >
            Create one for free
          </Link>
        </>
      }
    >
      <div className="space-y-6">
        {/* Google Sign In - Primary CTA */}
        <div>
          <form action={signInWithGoogleAction}>
            <input type="hidden" name="next" value={formNext} />
            <button
              type="submit"
              className="group relative flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[var(--border-warm)] bg-white px-4 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition hover:border-[var(--graphite-light)] hover:bg-[var(--highlight)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
              <span className="absolute right-4 text-[var(--text-tertiary)] transition group-hover:translate-x-0.5 group-hover:text-[var(--text-secondary)]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </button>
          </form>
          <p className="mt-3 text-center text-xs text-[var(--text-tertiary)]">
            Recommended for fastest sign-in experience
          </p>
        </div>

        {/* Divider */}
        <div className="relative flex items-center py-2">
          <div className="flex-1 border-t border-[var(--border-warm)]" />
          <span className="mx-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.1em] text-[var(--text-tertiary)]">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            or use email
          </span>
          <div className="flex-1 border-t border-[var(--border-warm)]" />
        </div>

        {/* Email/Password Form */}
        <form action={signInWithPasswordAction} className="space-y-5">
          <input type="hidden" name="next" value={formNext} />
          
          <div className="space-y-4">
            <AuthField
              label="Email address"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@company.com"
              icon="email"
              required
            />
            <AuthField
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              icon="password"
              required
            />
          </div>

          <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <AuthSubmitButton
              pendingLabel="Signing in..."
              variant="secondary"
              className="sm:min-w-[160px]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              <span>Sign in</span>
            </AuthSubmitButton>
            <Link
              href={forgotPasswordPath}
              className="text-sm font-medium text-[var(--copper)] transition hover:text-[var(--copper-light)]"
            >
              Forgot password?
            </Link>
          </div>
        </form>

        {/* Security note */}
        <div className="flex items-start gap-3 rounded-xl border border-[var(--border-warm)] bg-[var(--highlight)]/50 px-4 py-3">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <p className="text-xs leading-5 text-[var(--text-secondary)]">
            Your connection is secured with TLS encryption. We never store your password in plain text.
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
