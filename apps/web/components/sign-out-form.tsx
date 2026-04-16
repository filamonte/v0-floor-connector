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
          "rounded-lg border border-[--line] px-3 py-1.5 text-sm font-medium text-[--muted] transition hover:bg-[--surface-strong] hover:text-white",
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
