"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type GlobalSearchResult = {
  id: string;
  type:
    | "opportunity"
    | "customer"
    | "project"
    | "appointment"
    | "estimate"
    | "contract"
    | "invoice"
    | "job"
    | "punchlist"
    | "payment"
    | "person"
    | "vendor";
  title: string;
  subtitle: string;
  meta: string;
  href: string;
  score: number;
};

type GlobalSearchGroup = {
  key: GlobalSearchResult["type"];
  label: string;
  results: GlobalSearchResult[];
};

type GlobalSearchResponse = {
  query: string;
  totalCount: number;
  groups: GlobalSearchGroup[];
  error?: string;
};

type GlobalSearchProps = {
  buttonClassName?: string;
  buttonLabel?: string;
  compact?: boolean;
};

const globalSearchIconStyle = {
  flexShrink: 0
} as const;

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      className="h-4.5 w-4.5"
      style={{ ...globalSearchIconStyle, width: "18px", height: "18px" }}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      width="16"
      height="16"
      className="h-4 w-4"
      style={{ ...globalSearchIconStyle, width: "16px", height: "16px" }}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10h12" />
      <path d="m11 5 5 5-5 5" />
    </svg>
  );
}

const defaultButtonClassName =
  "inline-flex h-10 min-w-[240px] items-center justify-between rounded-[4px] border border-[var(--border-warm)] bg-[var(--cream)] px-3.5 text-[13px] font-medium text-[var(--text-secondary)] transition hover:border-[var(--copper)] hover:bg-white hover:text-[var(--text-primary)]";

export function GlobalSearch({
  buttonClassName = defaultButtonClassName,
  buttonLabel = "Global search",
  compact = false
}: GlobalSearchProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 30);

    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";

      if (isShortcut) {
        event.preventDefault();
        setOpen(true);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeydown);

    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setResults(null);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void (async () => {
        setLoading(true);
        setError(null);

        try {
          const response = await fetch(`/api/global-search?q=${encodeURIComponent(trimmedQuery)}`, {
            signal: controller.signal,
            cache: "no-store"
          });
          const payload = (await response.json()) as GlobalSearchResponse;

          if (!response.ok) {
            throw new Error(payload.error ?? "Unable to search contractor records.");
          }

          setResults(payload);
        } catch (requestError) {
          if (controller.signal.aborted) {
            return;
          }

          setResults(null);
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to search contractor records."
          );
        } finally {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        }
      })();
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [open, query]);

  const resultCount = useMemo(
    () => results?.groups.reduce((sum, group) => sum + group.results.length, 0) ?? 0,
    [results]
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={buttonClassName}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2">
          <SearchIcon />
          <span>{buttonLabel}</span>
        </span>
        {!compact ? (
          <span className="rounded-[4px] border border-[var(--border-warm)] bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--copper)]">
            Ctrl K
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80] bg-[var(--text-primary)]/40 px-4 py-6 sm:px-6" role="dialog" aria-modal="true" aria-label="Global search">
          <div className="mx-auto flex max-h-[calc(100vh-3rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[1.35rem] border border-[var(--border-warm)] bg-[var(--cream)] shadow-[0_36px_90px_-40px_rgba(23,18,15,0.55)]">
            <div className="flex items-center gap-3 border-b border-[var(--border-warm)] bg-white px-4 py-3 sm:px-5">
              <SearchIcon />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                placeholder="Search leads, customers, projects, appointments, estimates, contracts, invoices, jobs, payments, workforce people, or vendors"
                className="h-11 w-full bg-transparent text-[15px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex rounded-full border border-[var(--border-warm)] bg-[var(--cream)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)] transition hover:border-[var(--copper-light)] hover:bg-white"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
              {query.trim().length < 2 ? (
                <div className="space-y-4">
                  <div className="rounded-[1rem] border border-[var(--border-warm)] bg-white px-4 py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--copper)]">
                      Global search
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                      Find canonical records from one shared entry point
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                      Search across opportunities, customers, projects, appointments,
                      estimates, contracts, invoices, jobs, payments, workforce people, and vendors.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Leads / opportunities",
                      "Customers",
                      "Projects",
                      "Appointments",
                      "Estimates",
                      "Contracts",
                      "Invoices",
                      "Jobs",
                      "Payments",
                      "People (workforce)",
                      "Vendors"
                    ].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[var(--border-warm)] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ) : loading ? (
                <div className="rounded-[1rem] border border-[var(--border-warm)] bg-white px-4 py-5 text-sm text-[var(--text-secondary)]">
                  Searching current organization records...
                </div>
              ) : error ? (
                <div className="rounded-[1rem] border border-[var(--color-error)]/30 bg-[var(--color-error)]/5 px-4 py-5 text-sm text-[var(--color-error)]">
                  {error}
                </div>
              ) : results && resultCount > 0 ? (
                <div className="space-y-4">
                  {results.groups.map((group) => (
                    <section
                      key={group.key}
                      className="overflow-hidden rounded-[1rem] border border-[var(--border-warm)] bg-white"
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-[var(--border-warm)] bg-[var(--cream)] px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--copper)]">
                          {group.label}
                        </p>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--copper)]">
                          {group.results.length} result{group.results.length === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="divide-y divide-[var(--border-warm)]">
                        {group.results.map((result) => (
                          <Link
                            key={`${group.key}:${result.id}`}
                            href={result.href}
                            onClick={() => setOpen(false)}
                            className="group block px-4 py-3 transition hover:bg-[var(--highlight)]"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[var(--text-primary)] transition group-hover:text-[var(--copper)]">
                                  {result.title}
                                </p>
                                <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                                  {result.subtitle}
                                </p>
                                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                                  {result.meta}
                                </p>
                              </div>
                              <span className="mt-1 text-[var(--copper)] transition group-hover:translate-x-0.5">
                                <ArrowIcon />
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1rem] border border-[var(--border-warm)] bg-white px-4 py-5">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">No matching records</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    Try a broader search term or search by record number, customer, project,
                    email, phone, or status.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
