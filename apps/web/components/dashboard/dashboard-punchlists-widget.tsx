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
    <section className="overflow-hidden rounded-[4px] border border-[#dde2ea] bg-[#fcfcfd]">
      <div className="flex items-center justify-between gap-3 border-b border-[#e7ebf1] px-4 py-3">
        <h2 className="text-[15px] font-semibold text-[#17243b]">Open Punchlists</h2>
        <button
          type="button"
          aria-label="Refresh punchlists"
          className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-[#56657e] transition hover:bg-[#f2f5f9]"
        >
          <RefreshIcon />
        </button>
      </div>

      <div className="p-3">
        {punchlists.length === 0 ? (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2 px-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#75859f]">
              <span>Date</span>
              <span>Project</span>
              <span>Title</span>
            </div>
            <div className="h-px bg-[#edf0f4]" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="grid grid-cols-3 gap-2 px-1 py-1.5">
                  <div className="h-4 animate-pulse rounded bg-[#e5e7eb]" />
                  <div className="h-4 animate-pulse rounded bg-[#e5e7eb]" />
                  <div className="h-4 animate-pulse rounded bg-[#e5e7eb]" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#edf0f4]">
            <div className="grid grid-cols-3 gap-2 px-1 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#75859f]">
              <span>Date</span>
              <span>Project</span>
              <span>Title</span>
            </div>
            {punchlists.map((item) => (
              <Link
                key={item.id}
                href="/projects"
                className="grid grid-cols-3 items-center gap-2 rounded-[4px] px-1 py-2 transition hover:bg-[#f8fafc]"
              >
                <span className="text-[12px] text-[#64748b]">{item.date}</span>
                <span className="truncate text-[12px] font-medium text-[#17243b]">
                  {item.project}
                </span>
                <span className="truncate text-[12px] text-[#334155]">{item.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
