"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SaveFeedbackState = "idle" | "saving" | "success" | "error";

type UseDirtySaveStateOptions = {
  initialMessage?: string;
  resetSuccessAfterMs?: number;
  protectBeforeUnload?: boolean;
};

export function useDirtySaveState({
  initialMessage = "All changes saved.",
  resetSuccessAfterMs = 2500,
  protectBeforeUnload = true
}: UseDirtySaveStateOptions = {}) {
  const [status, setStatus] = useState<SaveFeedbackState>("idle");
  const [message, setMessage] = useState(initialMessage);
  const [isDirty, setIsDirty] = useState(false);
  const dirtyVersionRef = useRef(0);

  const markDirty = useCallback(() => {
    dirtyVersionRef.current += 1;
    setIsDirty(true);
    setStatus((currentStatus) => (currentStatus === "saving" ? currentStatus : "idle"));
    setMessage("Unsaved changes");
  }, []);

  const beginSave = useCallback(() => {
    const saveVersion = dirtyVersionRef.current;
    setStatus("saving");
    setMessage("Saving...");
    return saveVersion;
  }, []);

  const markSaved = useCallback(
    (saveVersion = dirtyVersionRef.current, nextMessage = "Saved") => {
      if (saveVersion !== dirtyVersionRef.current) {
        setIsDirty(true);
        setStatus("idle");
        setMessage("Unsaved changes");
        return;
      }

      setIsDirty(false);
      setStatus("success");
      setMessage(nextMessage);
    },
    []
  );

  const markSaveFailed = useCallback((nextMessage = "Save failed") => {
    setIsDirty(true);
    setStatus("error");
    setMessage(nextMessage);
  }, []);

  useEffect(() => {
    if (status !== "success") {
      return;
    }

    const timeoutId = setTimeout(() => {
      setStatus("idle");
      setMessage(initialMessage);
    }, resetSuccessAfterMs);

    return () => clearTimeout(timeoutId);
  }, [initialMessage, resetSuccessAfterMs, status]);

  useEffect(() => {
    if (!protectBeforeUnload) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, protectBeforeUnload]);

  return {
    status,
    message,
    isDirty,
    markDirty,
    beginSave,
    markSaved,
    markSaveFailed
  };
}
