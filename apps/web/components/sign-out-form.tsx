import { signOutAction } from "@/lib/auth/actions";

type SignOutFormProps = {
  className?: string;
};

export function SignOutForm({ className }: SignOutFormProps) {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className={[
          "rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white",
          className
        ]
          .filter(Boolean)
          .join(" ")}
      >
        Sign out
      </button>
    </form>
  );
}
