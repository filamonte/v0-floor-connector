"use client";

import { useMemo, useState } from "react";

type AccountingExportActionsProps = {
  csvContent: string;
  filename: string;
  disabled?: boolean;
};

export function AccountingExportActions({
  csvContent,
  filename,
  disabled = false
}: AccountingExportActionsProps) {
  const [message, setMessage] = useState<string | null>(null);
  const canUseClipboard = useMemo(
    () => typeof navigator !== "undefined" && Boolean(navigator.clipboard),
    []
  );

  async function copyCsv() {
    if (disabled || !canUseClipboard) {
      setMessage("Copy is not available in this browser.");
      return;
    }

    await navigator.clipboard.writeText(csvContent);
    setMessage("CSV rows copied.");
  }

  function downloadCsv() {
    if (disabled) {
      return;
    }

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMessage("CSV download prepared.");
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={() => {
          void copyCsv();
        }}
        disabled={disabled}
        className="inline-flex items-center justify-center rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm font-medium text-[#334155] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Copy CSV
      </button>
      <button
        type="button"
        onClick={downloadCsv}
        disabled={disabled}
        className="inline-flex items-center justify-center rounded-[4px] border border-[#171717] bg-[#171717] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Download CSV
      </button>
      {message ? (
        <span className="text-sm leading-5 text-slate-500">{message}</span>
      ) : null}
    </div>
  );
}
