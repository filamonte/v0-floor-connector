"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type AuthSubmitButtonProps = {
  pendingLabel: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  disabled?: boolean;
};

export function AuthSubmitButton({
  pendingLabel,
  children,
  variant = "primary",
  className,
  disabled = false
}: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();

  const buttonClassName =
    variant === "secondary"
      ? "inline-flex h-9 w-full items-center justify-center gap-2 border border-[var(--border-warm)] bg-white px-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--highlight)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      : "inline-flex h-9 w-full items-center justify-center gap-2 border border-[var(--copper)] bg-[var(--copper)] px-3 text-sm font-medium text-white transition hover:bg-[var(--copper-light)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto";

  return (
    <button
      type="submit"
      className={`${buttonClassName} ${className ?? ""}`.trim()}
      disabled={pending || disabled}
      aria-disabled={pending || disabled}
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
