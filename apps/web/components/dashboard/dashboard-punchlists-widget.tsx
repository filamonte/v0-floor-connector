"use client";

import Link from "next/link";

type PunchlistItem = {
  id: string;
  date: string;
  project: string;
  title: string;
};

type DashboardPunchlistsWidgetProps = {
  punchlists?: PunchlistItem[];
};

function RefreshIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 text-[#4d5d78]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 11a8 8 0 0 0-14.7-4M4 13a8 8 0 0 0 14.7 4" />
      <path d="M4 4v4h4M20 20v-4h-4" />
    </svg>
  );
}

const DEFAULT_PUNCHLISTS: PunchlistItem[] = [];

export function DashboardPunchlistsWidget({
  punchlists = DEFAULT_PUNCHLISTS
}: DashboardPunchlistsWidgetProps) {
  return (
    <section className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5">
        <h2 className="text-sm font-semibold text-[#17243b]">Open Punchlists</h2>
        <button
          type="button"
          aria-label="Refresh punchlists"
          className="inline-flex h-6 w-6 items-center justify-center rounded text-[#94a3b8] transition hover:text-[#64748b]"
        >
          <RefreshIcon />
        </button>
      </div>

      <div className="px-4 pb-4">
        {punchlists.length === 0 ? (
          <div className="py-6 text-center text-sm text-[#94a3b8]">
            No open punchlists
          </div>
        ) : (
          <div className="divide-y divide-[#f1f5f9]">
            {punchlists.map((item) => (
              <Link
                key={item.id}
                href="/projects"
                className="flex items-center gap-3 py-2 transition first:pt-0 last:pb-0 hover:bg-[#fafafa]"
              >
                <span className="text-[11px] text-[#94a3b8]">{item.date}</span>
                <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-[#17243b]">
                  {item.project}
                </span>
                <span className="truncate text-[12px] text-[#64748b]">{item.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
