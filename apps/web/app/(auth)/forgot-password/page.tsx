import Link from "next/link";

import { AuthShell } from "@/components/auth-shell";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { requestPasswordResetAction } from "@/lib/auth/actions";
import { getSafeInternalRedirectPath, signInPath } from "@/lib/auth/paths";
import { redirectIfAuthenticated } from "@/lib/auth/session";

type ForgotPasswordPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
    next?: string;
    email?: string;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams
}: ForgotPasswordPageProps) {
  const params = (await searchParams) ?? {};
  const next = getSafeInternalRedirectPath(params.next) ?? "";
  const initialEmail = params.email?.trim() ?? "";
  const signInSearchParams = new URLSearchParams();

  if (next) {
    signInSearchParams.set("next", next);
  }

  if (initialEmail) {
    signInSearchParams.set("email", initialEmail);
  }

  const signInHref = signInSearchParams.size
    ? `${signInPath}?${signInSearchParams.toString()}`
    : signInPath;

  await redirectIfAuthenticated(next);

  return (
    <AuthShell
      title="Reset your password"
      description="Reset the password for a fallback email/password account when Google sign-in is not being used."
      error={params.error}
      message={params.message}
      footer={
        <>
          Remembered it?{" "}
          <Link href={signInHref} className="font-medium text-brand-700">
            Return to sign in
          </Link>
        </>
      }
    >
      <form action={requestPasswordResetAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            defaultValue={initialEmail}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700"
            placeholder="you@company.com"
            required
          />
        </label>
        <AuthSubmitButton pendingLabel="Sending reset link...">
          Send reset link
        </AuthSubmitButton>
      </form>
    </AuthShell>
  );
}
