import Link from "next/link";

import { AuthShell } from "@/components/auth-shell";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { requestPasswordResetAction } from "@/lib/auth/actions";
import { signInPath } from "@/lib/auth/paths";
import { redirectIfAuthenticated } from "@/lib/auth/session";

type ForgotPasswordPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams
}: ForgotPasswordPageProps) {
  const params = (await searchParams) ?? {};

  await redirectIfAuthenticated();

  return (
    <AuthShell
      title="Reset your password"
      description="Reset the password for a fallback email/password account when Google sign-in is not being used."
      error={params.error}
      message={params.message}
      footer={
        <>
          Remembered it?{" "}
          <Link href={signInPath} className="font-medium text-brand-700">
            Return to sign in
          </Link>
        </>
      }
    >
      <form action={requestPasswordResetAction} className="space-y-4">
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
        <AuthSubmitButton pendingLabel="Sending reset link...">
          Send reset link
        </AuthSubmitButton>
      </form>
    </AuthShell>
  );
}
