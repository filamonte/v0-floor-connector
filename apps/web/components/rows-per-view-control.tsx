"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export const DEFAULT_ROWS_PER_VIEW = 25;
export const ROWS_PER_VIEW_OPTIONS = [10, 25, 50, 100, "all"] as const;

export type RowsPerViewOption = (typeof ROWS_PER_VIEW_OPTIONS)[number];

const ROWS_PER_VIEW_EVENT = "fc:grid-rows-change";

function normalizeRowsPerViewOption(value: string | null | undefined): RowsPerViewOption {
  if (value === "all") {
    return "all";
  }

  const parsed = Number(value);

  if (
    Number.isInteger(parsed) &&
    ROWS_PER_VIEW_OPTIONS.includes(parsed as RowsPerViewOption)
  ) {
    return parsed as RowsPerViewOption;
  }

  return DEFAULT_ROWS_PER_VIEW;
}

export function applyRowsPerView<T>(items: T[], rowsPerView: RowsPerViewOption) {
  return rowsPerView === "all" ? items : items.slice(0, rowsPerView);
}

export function formatRowsPerViewVisibleCount(
  totalCount: number,
  renderedCount: number,
  rowsPerView: RowsPerViewOption
) {
  if (totalCount === 0 || rowsPerView === "all" || renderedCount === totalCount) {
    return `${totalCount} visible`;
  }

  return `${renderedCount} of ${totalCount} visible`;
}

export function useRowsPerViewPreference(storageKey: string) {
  const [rowsPerView, setRowsPerViewState] =
    useState<RowsPerViewOption>(DEFAULT_ROWS_PER_VIEW);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setRowsPerViewState(normalizeRowsPerViewOption(window.localStorage.getItem(storageKey)));

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) {
        return;
      }

      setRowsPerViewState(normalizeRowsPerViewOption(event.newValue));
    };

    const handlePreferenceChange = (event: Event) => {
      const detail = (event as CustomEvent<{ key?: string; value?: string }>).detail;

      if (!detail || detail.key !== storageKey) {
        return;
      }

      setRowsPerViewState(normalizeRowsPerViewOption(detail.value));
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(ROWS_PER_VIEW_EVENT, handlePreferenceChange as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(ROWS_PER_VIEW_EVENT, handlePreferenceChange as EventListener);
    };
  }, [storageKey]);

  const setRowsPerView = useCallback(
    (nextValue: RowsPerViewOption) => {
      setRowsPerViewState(nextValue);

      if (typeof window === "undefined") {
        return;
      }

      window.localStorage.setItem(storageKey, String(nextValue));
      window.dispatchEvent(
        new CustomEvent(ROWS_PER_VIEW_EVENT, {
          detail: { key: storageKey, value: String(nextValue) }
        })
      );
    },
    [storageKey]
  );

  return useMemo(
    () => ({
      rowsPerView,
      setRowsPerView
    }),
    [rowsPerView, setRowsPerView]
  );
}

type RowsPerViewControlProps = {
  storageKey: string;
};

export function RowsPerViewControl({ storageKey }: RowsPerViewControlProps) {
  const { rowsPerView, setRowsPerView } = useRowsPerViewPreference(storageKey);

  return (
    <label className="inline-flex h-8 items-center gap-2 border border-[#d9cdc2] bg-white px-3 text-sm text-[#594839]">
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#8f7f72]">Show</span>
      <select
        value={String(rowsPerView)}
        onChange={(event) =>
          setRowsPerView(normalizeRowsPerViewOption(event.target.value))
        }
        aria-label="Rows per view"
        className="bg-transparent text-sm font-medium text-[#594839] outline-none"
      >
        {ROWS_PER_VIEW_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option === "all" ? "All" : option}
          </option>
        ))}
      </select>
    </label>
  );
}
