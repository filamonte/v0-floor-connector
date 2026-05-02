"use client";

import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";
import type { SaveFeedbackState } from "@/lib/save-feedback/use-dirty-save-state";

type SaveStatusButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  status: SaveFeedbackState;
  isDirty?: boolean;
  statusMessage?: string;
};

const buttonLabels: Record<SaveFeedbackState, string> = {
  idle: "Save now",
  saving: "Saving...",
  success: "Saved",
  error: "Save failed"
};

export function SaveStatusButton({
  status,
  isDirty = false,
  statusMessage,
  className,
  disabled,
  ...props
}: SaveStatusButtonProps) {
  const label = buttonLabels[status];
  const liveMessage =
    status === "idle" && isDirty ? "Unsaved changes" : statusMessage ?? label;

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        {...props}
        disabled={disabled || status === "saving"}
        className={cn(
          "inline-flex h-9 min-w-[124px] items-center justify-center border px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70",
          status === "success"
            ? "border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800"
            : status === "error"
              ? "border-rose-700 bg-rose-700 text-white hover:bg-rose-800"
              : "border-[#d8731f] bg-[#d8731f] text-white hover:bg-[#bf6519]",
          className
        )}
      >
        {label}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {liveMessage}
      </span>
    </div>
  );
}
