import Link from "next/link";
import { StatusBadge } from "@floorconnector/ui";

type ManagerDashboardItem = {
  href: string;
  title: string;
  subtitle: string;
  meta?: string | null;
  badge?: string | null;
  trailing?: string | null;
};

type ManagerDashboardCardProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
  items: ManagerDashboardItem[];
  emptyTitle: string;
  emptyDescription: string;
};

export function ManagerDashboardCard({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
  items,
  emptyTitle,
  emptyDescription
}: ManagerDashboardCardProps) {
  return (
    <section className="flex h-full min-w-0 flex-col overflow-hidden rounded-[4px] border border-[#d1d5db] bg-white shadow-[0_1px_0_rgba(9,9,11,0.035)]">
      <div className="h-[3px] bg-[#005eb8]" />
      <div className="flex flex-col items-start gap-3 border-b border-[#e5e7eb] bg-[#fbfcfd] px-3 py-3 sm:flex-row sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#005eb8]">
              {eyebrow}
            </p>
          ) : null}
          <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-[var(--text-primary)]">
            {title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--text-secondary)]">
            {description}
          </p>
        </div>
        <Link
          href={actionHref}
          className="inline-flex max-w-full items-center whitespace-normal rounded-[4px] border border-[#c7d2e2] bg-white px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#004f9e] transition hover:border-[#005eb8] hover:bg-[#eef6ff] hover:text-[#003d7c] [overflow-wrap:anywhere] sm:shrink-0"
        >
          {actionLabel}
        </Link>
      </div>

      <div className="flex-1 divide-y divide-[var(--border-warm)]">
        {items.length > 0 ? (
          items.map((item, index) => (
            <Link
              key={`${item.href}:${item.title}:${index}`}
              href={item.href}
              className="group flex min-w-0 flex-col gap-2 px-3 py-3 transition hover:bg-[#f7fbff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005eb8] focus-visible:ring-inset sm:flex-row sm:items-start sm:justify-between sm:gap-3"
            >
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)] transition group-hover:text-[var(--graphite-dark)]">
                    {item.title}
                  </p>
                  {item.badge ? (
                    <StatusBadge status={item.badge} size="sm">
                      {item.badge}
                    </StatusBadge>
                  ) : null}
                </div>
                <p className="mt-1 whitespace-normal break-words text-sm leading-5 text-[var(--text-secondary)] [overflow-wrap:anywhere]">
                  {item.subtitle}
                </p>
                {item.meta ? (
                  <p className="mt-1 whitespace-normal break-words text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-secondary)] [overflow-wrap:anywhere]">
                    {item.meta}
                  </p>
                ) : null}
              </div>
              {item.trailing ? (
                <p className="whitespace-normal break-words text-sm font-semibold text-[var(--text-primary)] [overflow-wrap:anywhere] sm:shrink-0 sm:text-right">
                  {item.trailing}
                </p>
              ) : null}
            </Link>
          ))
        ) : (
          <div className="m-3 rounded-[4px] border border-dashed border-[#cbd5e1] bg-[#f9fafb] px-3 py-4">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {emptyTitle}
            </p>
            <p className="mt-2 text-sm leading-5 text-[var(--text-secondary)]">
              {emptyDescription}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
