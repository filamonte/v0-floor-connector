"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormHTMLAttributes,
  type ReactNode
} from "react";

import { SaveStatusButton } from "@/components/save-feedback/save-status-button";
import {
  useDirtySaveState,
  type SaveFeedbackState
} from "@/lib/save-feedback/use-dirty-save-state";
import { cn } from "@/lib/utils";

type SaveStateFormContextValue = {
  enabled: boolean;
  isDirty: boolean;
  status: SaveFeedbackState;
  message: string;
  pendingLabel: string;
};

const SaveStateFormContext = createContext<SaveStateFormContextValue | null>(null);

type SaveStateFormProps = Omit<FormHTMLAttributes<HTMLFormElement>, "action"> & {
  action: (formData: FormData) => void | Promise<void>;
  enabled?: boolean;
  pendingLabel?: string;
  children: ReactNode;
};

function normalizeFormData(form: HTMLFormElement) {
  const entries = Array.from(new FormData(form).entries())
    .map(([name, value]) => {
      if (value instanceof File) {
        return value.size > 0 ? [name, `file:${value.name}:${value.size}:${value.lastModified}`] : null;
      }

      return [name, value.replace(/\r\n/g, "\n").trim()];
    })
    .filter((entry): entry is [string, string] => Boolean(entry));

  entries.sort(([firstName, firstValue], [secondName, secondValue]) => {
    const nameCompare = firstName.localeCompare(secondName);
    return nameCompare === 0 ? firstValue.localeCompare(secondValue) : nameCompare;
  });

  return JSON.stringify(entries);
}

export function SaveStateForm({
  action,
  enabled = true,
  pendingLabel = "Saving...",
  children,
  onSubmit,
  onChange,
  onInput,
  ...props
}: SaveStateFormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const savedSnapshotRef = useRef<string | null>(null);
  const {
    status,
    message,
    isDirty,
    markDirty,
    markClean,
    beginSave,
    markSaved,
    markSaveFailed
  } = useDirtySaveState({
    initialMessage: "Saved",
    protectBeforeUnload: enabled
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshDirtyState = useCallback(() => {
    if (!enabled || !formRef.current || savedSnapshotRef.current === null) {
      return;
    }

    if (normalizeFormData(formRef.current) !== savedSnapshotRef.current) {
      markDirty();
      return;
    }

    markClean();
  }, [enabled, markClean, markDirty]);

  useEffect(() => {
    if (!enabled || !formRef.current) {
      return;
    }

    savedSnapshotRef.current = normalizeFormData(formRef.current);
  }, [enabled]);

  async function handleAction(formData: FormData) {
    if (!enabled) {
      setIsSubmitting(true);

      try {
        await action(formData);
        return;
      } finally {
        setIsSubmitting(false);
      }
    }

    const saveVersion = beginSave();
    setIsSubmitting(true);

    try {
      await action(formData);

      if (formRef.current) {
        savedSnapshotRef.current = normalizeFormData(formRef.current);
      }

      markSaved(saveVersion);
    } catch (error) {
      markSaveFailed();
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  const contextValue = useMemo(
    () => ({
      enabled,
      isDirty,
      status: isSubmitting ? "saving" as const : status,
      message: isSubmitting ? pendingLabel : message,
      pendingLabel
    }),
    [enabled, isDirty, isSubmitting, message, pendingLabel, status]
  );

  return (
    <SaveStateFormContext.Provider value={contextValue}>
      <form
        {...props}
        ref={formRef}
        onSubmit={(event) => {
          onSubmit?.(event);

          if (event.defaultPrevented) {
            return;
          }

          event.preventDefault();
          void handleAction(new FormData(event.currentTarget));
        }}
        onChange={(event) => {
          onChange?.(event);
          refreshDirtyState();
        }}
        onInput={(event) => {
          onInput?.(event);
          refreshDirtyState();
        }}
      >
        {children}
      </form>
    </SaveStateFormContext.Provider>
  );
}

type SaveStateSubmitButtonProps = {
  submitLabel: string;
  pendingLabel: string;
  className?: string;
  variant?: "primary" | "secondary";
};

export function SaveStateSubmitButton({
  submitLabel,
  pendingLabel,
  className,
  variant = "primary"
}: SaveStateSubmitButtonProps) {
  const context = useContext(SaveStateFormContext);

  if (!context) {
    throw new Error("SaveStateSubmitButton must be rendered inside SaveStateForm.");
  }

  if (context.enabled) {
    return (
      <SaveStatusButton
        type="submit"
        status={context.status}
        isDirty={context.isDirty}
        statusMessage={context.message}
        className={className}
      />
    );
  }

  const isSaving = context.status === "saving";
  const buttonClassName =
    variant === "secondary"
      ? "inline-flex h-9 w-full items-center justify-center gap-2 border border-[#d6d6d6] bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      : "inline-flex h-9 w-full items-center justify-center gap-2 border border-[#d8731f] bg-[#d8731f] px-3 text-sm font-medium text-white transition hover:bg-[#bf6519] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto";

  return (
    <button
      type="submit"
      className={cn(buttonClassName, className)}
      disabled={isSaving}
      aria-disabled={isSaving}
    >
      {isSaving ? pendingLabel : submitLabel}
    </button>
  );
}
