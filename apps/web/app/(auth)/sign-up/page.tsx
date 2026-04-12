import Link from "next/link";

import { AuthShell } from "@/components/auth-shell";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { signInWithGoogleAction, signUpAction } from "@/lib/auth/actions";
import { sanitizeRedirectPath, signInPath } from "@/lib/auth/paths";
import { redirectIfAuthenticated } from "@/lib/auth/session";

type SignUpPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = (await searchParams) ?? {};
  const next = sanitizeRedirectPath(params.next);

  await redirectIfAuthenticated(next);

  return (
    <AuthShell
      title="Create your account"
      description="Start with Google for the primary FloorConnector onboarding path. Email and password remain available as a backup account option."
      error={params.error}
      message={params.message}
      footer={
        <>
          Already have an account?{" "}
          <Link href={`${signInPath}?next=${encodeURIComponent(next)}`} className="font-medium text-brand-700">
            Sign in
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

        <form action={signUpAction} className="space-y-4">
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
              autoComplete="new-password"
              minLength={8}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700"
              placeholder="Use at least 8 characters"
              required
            />
          </label>
          <AuthSubmitButton pendingLabel="Creating account..." variant="secondary">
            Create account with email
          </AuthSubmitButton>
        </form>
      </div>
    </AuthShell>
  );
}
