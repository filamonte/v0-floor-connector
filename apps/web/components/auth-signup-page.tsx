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
  }>;
};

export async function AuthSignupPage({ searchParams }: AuthSignupPageProps) {
  const params = (await searchParams) ?? {};
  const next = sanitizeRedirectPath(params.next);
  const formNext = getSafeInternalRedirectPath(params.next) ?? "";
  const nextQuery = formNext ? `?next=${encodeURIComponent(formNext)}` : "";
  const surfaceContext = getAuthSurfaceContext(next);

  await redirectIfAuthenticated(formNext);

  return (
    <AuthShell
      eyebrow={surfaceContext.shellEyebrow}
      title="Create your account"
      description={`Start with Google for the preferred setup flow, or create an email/password account when you need the fallback option. After sign-up, you will continue to the same ${surfaceContext.surfaceKey === "portal" ? "portal" : surfaceContext.surfaceKey === "superAdmin" ? "admin" : "workspace"} destination.`}
      error={params.error}
      message={params.message}
      surfaceContext={surfaceContext}
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={`${signInPath}${nextQuery}`}
            className="font-medium text-[var(--copper)] hover:text-[var(--copper-light)]"
          >
            Log in
          </Link>
        </>
      }
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-[var(--border-warm)] bg-[var(--highlight)] p-4">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Preferred account setup
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
            Google is the primary sign-up path. Email and password remain fully
            supported for users who cannot use Google.
          </p>
        </div>

        <form action={signInWithGoogleAction} className="space-y-3">
          <input type="hidden" name="next" value={formNext} />
          <AuthSubmitButton pendingLabel="Redirecting to Google..." className="sm:w-full">
            <span className="text-base" aria-hidden="true">
              G
            </span>
            <span>Continue with Google</span>
          </AuthSubmitButton>
          <p className="text-xs leading-5 text-[var(--text-secondary)]">
            {surfaceContext.nextStepDescription}
          </p>
        </form>

        <div className="flex items-center gap-3 py-2">
          <div className="h-px flex-1 bg-[var(--border-warm)]" />
          <span className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--text-tertiary)]">
            Email signup
          </span>
          <div className="h-px flex-1 bg-[var(--border-warm)]" />
        </div>

        <form action={signUpAction} className="space-y-4">
          <input type="hidden" name="next" value={formNext} />
          <div className="grid gap-4">
            <AuthField
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@company.com"
              hint="Use an address you can verify if email confirmation is enabled."
              required
            />
            <AuthField
              label="Password"
              type="password"
              name="password"
              autoComplete="new-password"
              minLength={8}
              placeholder="Use at least 8 characters"
              hint="Choose at least 8 characters. You can change this later from the password reset flow."
              required
            />
          </div>
          <div className="rounded-2xl border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 px-4 py-3 text-sm text-[var(--copper)]">
            If your Supabase project requires email confirmation, you will need
            to confirm the account before logging in.
          </div>
          <AuthSubmitButton
            pendingLabel="Creating account..."
            variant="secondary"
            className="sm:min-w-[220px]"
          >
            <span>Create account with email</span>
          </AuthSubmitButton>
        </form>
      </div>
    </AuthShell>
  );
}
