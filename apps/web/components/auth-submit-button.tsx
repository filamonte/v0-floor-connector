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
      ? "inline-flex h-10 w-full items-center justify-center gap-2 border border-[#e2dcd5] bg-white px-4 text-[13px] font-medium text-[#5f564d] transition hover:border-[#ef7d32] hover:text-[#221a14] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      : "inline-flex h-10 w-full items-center justify-center gap-2 bg-[#ef7d32] px-4 text-[13px] font-semibold text-white transition hover:bg-[#d86b28] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto";

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
