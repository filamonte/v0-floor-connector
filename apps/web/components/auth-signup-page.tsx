import Link from "next/link";

import { AuthField } from "@/components/auth-field";
import { AuthShell } from "@/components/auth-shell";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { signInWithGoogleAction, signUpAction } from "@/lib/auth/actions";
import {
  getAuthSurfaceContext,
  getSafeInternalRedirectPath,
  sanitizeRedirectPath,
  signInPath
} from "@/lib/auth/paths";
import { redirectIfAuthenticated } from "@/lib/auth/session";

type AuthSignupPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
    next?: string;
    email?: string;
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

export async function AuthSignupPage({ searchParams }: AuthSignupPageProps) {
  const params = (await searchParams) ?? {};
  const next = sanitizeRedirectPath(params.next);
  const formNext = getSafeInternalRedirectPath(params.next) ?? "";
  const initialEmail = params.email?.trim() ?? "";
  const linkedSearchParams = new URLSearchParams();

  if (formNext) {
    linkedSearchParams.set("next", formNext);
  }

  if (initialEmail) {
    linkedSearchParams.set("email", initialEmail);
  }

  const linkedQuery = linkedSearchParams.size
    ? `?${linkedSearchParams.toString()}`
    : "";
  const surfaceContext = getAuthSurfaceContext(next);

  await redirectIfAuthenticated(formNext);

  return (
    <AuthShell
      eyebrow={surfaceContext.shellEyebrow}
      title="Create your account"
      description={`Get started with FloorConnector to manage your ${surfaceContext.surfaceKey === "portal" ? "customer portal" : surfaceContext.surfaceKey === "superAdmin" ? "admin dashboard" : "projects, estimates, and contracts"}. Sign up takes less than a minute.`}
      error={params.error}
      message={params.message}
      surfaceContext={surfaceContext}
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={`${signInPath}${linkedQuery}`}
            className="font-semibold text-[var(--copper)] transition hover:text-[var(--copper-light)]"
          >
            Sign in instead
          </Link>
        </>
      }
    >
      <div className="space-y-6">
        {/* Google Sign Up - Primary CTA */}
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
            Fastest way to get started - no password needed
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
        <form action={signUpAction} className="space-y-5">
          <input type="hidden" name="next" value={formNext} />
          
          <div className="space-y-4">
            <AuthField
              label="Email address"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@company.com"
              defaultValue={initialEmail}
              icon="email"
              hint="Use an email you can verify if confirmation is required."
              required
            />
            <AuthField
              label="Create password"
              type="password"
              name="password"
              autoComplete="new-password"
              minLength={8}
              placeholder="At least 8 characters"
              icon="password"
              hint="Choose a strong password with at least 8 characters."
              required
            />
          </div>

          {/* Info note */}
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-xs leading-5 text-amber-800">
              If email confirmation is enabled, you&apos;ll need to verify your email before signing in.
            </p>
          </div>

          <AuthSubmitButton
            pendingLabel="Creating account..."
            variant="secondary"
            className="w-full sm:w-auto sm:min-w-[180px]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
            <span>Create account</span>
          </AuthSubmitButton>
        </form>

        {/* Terms note */}
        <p className="text-center text-xs leading-5 text-[var(--text-tertiary)]">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-[var(--text-secondary)] underline hover:text-[var(--text-primary)]">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-[var(--text-secondary)] underline hover:text-[var(--text-primary)]">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </AuthShell>
  );
}
