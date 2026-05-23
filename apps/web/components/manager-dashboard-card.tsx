import Link from "next/link";
import { getStatusBadgeClassName } from "@floorconnector/ui";

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
    <section className="flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-[var(--border-warm)] bg-white shadow-[0_16px_44px_-38px_rgba(31,41,55,0.48)]">
      <div className="h-1 bg-[var(--graphite)]" />
      <div className="flex flex-col items-start gap-3 border-b border-[var(--border-warm)] bg-[linear-gradient(135deg,white_0%,var(--highlight)_100%)] px-3 py-3 sm:flex-row sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--copper)]">
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
          className="inline-flex max-w-full items-center whitespace-normal rounded-md border border-[var(--copper)] bg-white px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--copper)] transition hover:bg-[var(--copper)] hover:text-white [overflow-wrap:anywhere] sm:shrink-0"
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
              className="group flex min-w-0 flex-col gap-2 px-3 py-3 transition hover:bg-[var(--highlight)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-inset sm:flex-row sm:items-start sm:justify-between sm:gap-3"
            >
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)] transition group-hover:text-[var(--graphite-dark)]">
                    {item.title}
                  </p>
                  {item.badge ? (
                    <span
                      className={[
                        "inline-flex shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
                        getStatusBadgeClassName(item.badge)
                      ].join(" ")}
                    >
                      {item.badge}
                    </span>
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
          <div className="m-3 rounded-lg border border-dashed border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-4">
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
