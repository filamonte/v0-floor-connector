import Link from "next/link";

import { AuthShell } from "@/components/auth-shell";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import {
  signInWithGoogleAction,
  signInWithPasswordAction
} from "@/lib/auth/actions";
import {
  forgotPasswordPath,
  sanitizeRedirectPath,
  signUpPath
} from "@/lib/auth/paths";
import { redirectIfAuthenticated } from "@/lib/auth/session";

type SignInPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = (await searchParams) ?? {};
  const next = sanitizeRedirectPath(params.next);

  await redirectIfAuthenticated(next);

  return (
    <AuthShell
      title="Sign in"
      description="Continue with Google for the primary FloorConnector sign-in flow. Email and password remain available as a fallback when Google is not an option."
      error={params.error}
      message={params.message}
      footer={
        <>
          Need an account?{" "}
          <Link href={`${signUpPath}?next=${encodeURIComponent(next)}`} className="font-medium text-brand-700">
            Create one
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        <form action={signInWithGoogleAction}>
          <input type="hidden" name="next" value={next} />
          <AuthSubmitButton pendingLabel="Redirecting...">
            Continue with Google
          </AuthSubmitButton>
        </form>

        <div className="flex items-center gap-3 py-2">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
            Fallback
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <form action={signInWithPasswordAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700"
              placeholder="you@company.com"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700"
              placeholder="Enter your password"
              required
            />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <AuthSubmitButton pendingLabel="Signing in..." variant="secondary">
              Sign in with password
            </AuthSubmitButton>
            <Link href={forgotPasswordPath} className="text-sm font-medium text-brand-700">
              Forgot password?
            </Link>
          </div>
        </form>
      </div>
    </AuthShell>
  );
}
