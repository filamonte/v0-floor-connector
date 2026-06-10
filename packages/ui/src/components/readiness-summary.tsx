import type { ReactNode } from "react";

import { ReadinessBadge } from "./status-badge";

export type ReadinessSummaryItem = {
  id: string;
  label: string;
  status: string;
  detail?: ReactNode;
};

export type ReadinessSummaryProps = {
  title: string;
  description?: ReactNode;
  items: ReadinessSummaryItem[];
  className?: string;
};

export function ReadinessSummary({
  title,
  description,
  items,
  className
}: ReadinessSummaryProps) {
  return (
    <section
      aria-label={title}
      className={[
        "rounded-lg border border-[var(--border-warm)] bg-white px-4 py-3 sm:px-5",
        className
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-3">
        <div className="min-w-0">
          <h2 className="text-[16px] font-semibold leading-6 text-[var(--text-primary)]">
            {title}
          </h2>
          {description ? (
            <div className="mt-1 max-w-3xl text-[13px] leading-5 text-[var(--text-secondary)]">
              {description}
            </div>
          ) : null}
        </div>
        <dl className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="min-w-0 rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2"
            >
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                {item.label}
              </dt>
              <dd className="mt-2">
                <ReadinessBadge status={item.status} />
              </dd>
              {item.detail ? (
                <dd className="mt-2 text-[12px] leading-4 text-[var(--text-secondary)]">
                  {item.detail}
                </dd>
              ) : null}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
