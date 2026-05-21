import { AuthShell } from "@/components/auth-shell";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { updatePasswordAction } from "@/lib/auth/actions";

type UpdatePasswordPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

export default async function UpdatePasswordPage({
  searchParams
}: UpdatePasswordPageProps) {
  const params = (await searchParams) ?? {};

  return (
    <AuthShell
      title="Choose a new password"
      description="Complete password reset or replace a temporary portal password before continuing."
      error={params.error}
      message={params.message}
    >
      <form action={updatePasswordAction} className="space-y-4">
        <input type="hidden" name="next" value={params.next ?? ""} />
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            New password
          </span>
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
        <AuthSubmitButton pendingLabel="Updating password...">
          Update password
        </AuthSubmitButton>
      </form>
    </AuthShell>
  );
}
