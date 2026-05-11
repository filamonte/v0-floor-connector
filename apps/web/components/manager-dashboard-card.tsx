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
    <section className="flex h-full flex-col rounded-lg border border-[var(--border-warm)] bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-[var(--border-warm)] px-3 py-2.5">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              {eyebrow}
            </p>
          ) : null}
          <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-[var(--text-primary)]">
            {title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--text-secondary)]">{description}</p>
        </div>
        <Link
          href={actionHref}
          className="inline-flex shrink-0 items-center rounded-md border border-[var(--border-warm)] bg-white px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)] transition hover:border-[var(--copper)] hover:bg-[var(--highlight)] hover:text-[var(--text-primary)]"
        >
          {actionLabel}
        </Link>
      </div>

      <div className="flex-1 divide-y divide-[var(--border-warm)]">
        {items.length > 0 ? (
          items.map((item) => (
            <Link
              key={`${item.href}:${item.title}`}
              href={item.href}
              className="group flex items-start justify-between gap-3 px-3 py-2.5 transition hover:bg-[var(--highlight)]"
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
                <p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">{item.subtitle}</p>
                {item.meta ? (
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                    {item.meta}
                  </p>
                ) : null}
              </div>
              {item.trailing ? (
                <p className="shrink-0 text-sm font-semibold text-[var(--text-primary)]">
                  {item.trailing}
                </p>
              ) : null}
            </Link>
          ))
        ) : (
          <div className="px-3 py-4">
            <p className="text-sm font-semibold text-[var(--text-primary)]">{emptyTitle}</p>
            <p className="mt-2 text-sm leading-5 text-[var(--text-secondary)]">{emptyDescription}</p>
          </div>
        )}
      </div>
    </section>
  );
}
