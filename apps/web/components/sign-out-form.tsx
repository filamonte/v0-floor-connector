import { signOutAction } from "@/lib/auth/actions";

type SignOutFormProps = {
  className?: string;
};

export function SignOutForm({ className }: SignOutFormProps) {
  const baseStyles =
    "rounded-md border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50";

  return (
    <form action={signOutAction}>
      <button type="submit" className={className ?? baseStyles}>
        Sign out
      </button>
    </form>
  );
}
