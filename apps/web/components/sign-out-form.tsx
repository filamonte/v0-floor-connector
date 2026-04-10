import { signOutAction } from "@/lib/auth/actions";

export function SignOutForm() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
      >
        Sign out
      </button>
    </form>
  );
}
