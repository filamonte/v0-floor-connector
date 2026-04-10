"use client";

import { useFormStatus } from "react-dom";

type AuthSubmitButtonProps = {
  pendingLabel: string;
  children: string;
  variant?: "primary" | "secondary";
};

export function AuthSubmitButton({
  pendingLabel,
  children,
  variant = "primary"
}: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();

  const className =
    variant === "secondary"
      ? "rounded-full border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      : "rounded-full bg-brand-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? pendingLabel : children}
    </button>
  );
}
