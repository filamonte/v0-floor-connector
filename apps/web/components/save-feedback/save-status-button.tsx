"use client";

import { Check } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";
import type { SaveFeedbackState } from "@/lib/save-feedback/use-dirty-save-state";

type SaveStatusButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  status: SaveFeedbackState;
  isDirty?: boolean;
  statusMessage?: string;
  labels?: Partial<Record<SaveFeedbackState, string>>;
};

const buttonLabels: Record<SaveFeedbackState, string> = {
  idle: "Save",
  saving: "Saving...",
  success: "Saved",
  error: "Save"
};

export function SaveStatusButton({
  status,
  isDirty = false,
  statusMessage,
  labels,
  className,
  disabled,
  ...props
}: SaveStatusButtonProps) {
  const isSaved = status === "success" || (!isDirty && status !== "saving" && status !== "error");
  const label = isSaved ? (labels?.success ?? "Saved") : (labels?.[status] ?? buttonLabels[status]);
  const liveMessage =
    status === "idle" && isDirty
      ? "Unsaved changes"
      : status === "error"
        ? statusMessage ?? "Save failed"
        : statusMessage ?? label;

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        {...props}
        disabled={disabled || status === "saving" || isSaved}
        className={cn(
          "inline-flex h-9 min-w-[124px] items-center justify-center gap-2 border px-3 text-sm font-semibold transition disabled:cursor-not-allowed",
          isSaved
            ? "border-emerald-700 bg-emerald-700 text-white"
            : status === "error"
              ? "border-[#d8731f] bg-[#d8731f] text-white hover:bg-[#bf6519]"
              : "border-[#d8731f] bg-[#d8731f] text-white hover:bg-[#bf6519]",
          className
        )}
      >
        {isSaved ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
        {label}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {liveMessage}
      </span>
    </div>
  );
}
