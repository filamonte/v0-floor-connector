"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type AuthSubmitButtonProps = {
  pendingLabel: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

export function AuthSubmitButton({
  pendingLabel,
  children,
  variant = "primary",
  className
}: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();

  const buttonClassName =
    variant === "secondary"
      ? "inline-flex w-full items-center justify-center gap-2 rounded border border-neutral-300 px-4 py-3 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      : "inline-flex w-full items-center justify-center gap-2 rounded bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto";

  return (
    <button
      type="submit"
      className={`${buttonClassName} ${className ?? ""}`.trim()}
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? (
        <>
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          />
          <span>{pendingLabel}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
