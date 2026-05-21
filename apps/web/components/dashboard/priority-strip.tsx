import Link from "next/link";
import { getStatusBadgeClassName } from "@floorconnector/ui";

import {
  dashboardGridDividerClassName,
  dashboardPanelClassName,
  dashboardPanelHeaderClassName
} from "@/components/dashboard/dashboard-surface-primitives";

export type DashboardPriorityItem = {
  key: string;
  label: string;
  title: string;
  detail: string;
  href: string;
  actionLabel: string;
  countLabel: string;
  status: string;
};

type PriorityStripProps = {
  items: DashboardPriorityItem[];
};

export function PriorityStrip({ items }: PriorityStripProps) {
  return (
    <section
      aria-labelledby="dashboard-priority-strip-title"
      className={dashboardPanelClassName}
    >
      <div
        className={[
          dashboardGridDividerClassName,
          "lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2.15fr)]"
        ].join(" ")}
      >
        <div className={["px-4 py-4", dashboardPanelHeaderClassName].join(" ")}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            Priority strip
          </p>
          <h2
            id="dashboard-priority-strip-title"
            className="mt-1 text-[20px] font-semibold tracking-tight text-[var(--text-primary)]"
          >
            Decide what needs attention first
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            These are the highest-signal dashboard queues from the existing
            contractor workflow data.
          </p>
        </div>

        <div
          className={[
            dashboardGridDividerClassName,
            "sm:grid-cols-2 xl:grid-cols-4"
          ].join(" ")}
        >
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="group flex min-h-[140px] flex-col bg-white px-4 py-4 transition hover:bg-[var(--highlight)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-inset"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                    {item.label}
                  </p>
                  <h3 className="mt-2 text-sm font-semibold leading-5 text-[var(--text-primary)] group-hover:text-[var(--graphite-dark)]">
                    {item.title}
                  </h3>
                </div>
                <span
                  className={[
                    "shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
                    getStatusBadgeClassName(item.status)
                  ].join(" ")}
                >
                  {item.countLabel}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--text-secondary)]">
                {item.detail}
              </p>
              <div className="mt-auto pt-3">
                <span className="inline-flex items-center border-t border-[var(--copper)] pt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)] transition group-hover:text-[var(--text-primary)]">
                  {item.actionLabel}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
