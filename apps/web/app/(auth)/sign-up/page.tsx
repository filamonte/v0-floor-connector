import Link from "next/link";

import { AuthShell } from "@/components/auth-shell";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { signUpAction } from "@/lib/auth/actions";
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
      description="Set up a FloorConnector login with email and password. Tenant membership and workspace routing will be layered in next."
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
        <AuthSubmitButton pendingLabel="Creating account...">
          Create account
        </AuthSubmitButton>
      </form>
    </AuthShell>
  );
}
